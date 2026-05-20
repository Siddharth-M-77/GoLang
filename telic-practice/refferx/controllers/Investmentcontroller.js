import mongoose from "mongoose";
import Investment, {
  LEVEL_PERCENTS,
  REFERRAL_BONUS_PERCENT,
  PACKAGE_TIERS,
} from "../models/Investment.js";
import Aroi from "../models/Aroi.js";
import UserModel from "../models/UserModel.js";
import {
  getEligibleAncestors,
  checkActivationCondition,
} from "../helpers/activationCheck.js";

async function distributeLevelIncome(investorId, investmentDoc, session) {
  const log = [];
  const ancestors = await getEligibleAncestors(investorId, 10);

  for (const { user, depth, isEligible } of ancestors) {
    const levelIndex = depth - 1;
    const percent = LEVEL_PERCENTS[levelIndex] ?? 0;
    if (!isEligible || percent === 0) {
      log.push({
        userId: user._id,
        depth,
        skipped: true,
        reason: isEligible ? "0% level" : "inactive (< 2 directs)",
      });
      continue;
    }

    const income = parseFloat(
      ((investmentDoc.investmentAmount * percent) / 100).toFixed(2),
    );

    // ── Aroi record ───────────────────────────────────────────────────────────
    await Aroi.create(
      [
        {
          userId: user._id,
          investmentId: investmentDoc._id,
          type: "level_income",
          sourceUserId: investorId,
          levelNumber: depth,
          planName: investmentDoc.name,
          investmentAmount: investmentDoc.investmentAmount,
          percentage: percent,
          roiAmount: income,
          creditedOn: new Date(),
        },
      ],
      { session },
    );

    // ── Update user wallet ────────────────────────────────────────────────────
    await UserModel.findByIdAndUpdate(
      user._id,
      {
        $inc: {
          levelIncome: income,
          currentEarnings: income,
          totalEarnings: income,
        },
      },
      { session },
    );

    log.push({
      userId: user._id,
      username: user.username,
      depth,
      percent,
      income,
      credited: true,
    });
  }

  return log;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: pay referral bonus (7% to direct sponsor)
// ─────────────────────────────────────────────────────────────────────────────
async function payReferralBonus(investor, investmentDoc, session) {
  if (!investor.sponserId) return null;

  const bonus = parseFloat(
    ((investmentDoc.investmentAmount * REFERRAL_BONUS_PERCENT) / 100).toFixed(
      2,
    ),
  );

  await Aroi.create(
    [
      {
        userId: investor.sponserId,
        investmentId: investmentDoc._id,
        type: "referral_bonus",
        sourceUserId: investor._id,
        levelNumber: 0,
        planName: investmentDoc.name,
        investmentAmount: investmentDoc.investmentAmount,
        percentage: REFERRAL_BONUS_PERCENT,
        roiAmount: bonus,
        creditedOn: new Date(),
      },
    ],
    { session },
  );

  await UserModel.findByIdAndUpdate(
    investor.sponserId,
    {
      $inc: {
        directReferalAmount: bonus,
        currentEarnings: bonus,
        totalEarnings: bonus,
      },
    },
    { session },
  );

  return {
    sponsorId: investor.sponserId,
    bonus,
    percent: REFERRAL_BONUS_PERCENT,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER: createInvestment
// POST /api/investment/create
// ─────────────────────────────────────────────────────────────────────────────
export const createInvestment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { packageId, investmentAmount, txHash, addedBy = "user" } = req.body;

    // ── Validate package amount ───────────────────────────────────────────────
    if (!PACKAGE_TIERS.includes(Number(investmentAmount))) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: `Invalid package. Choose from: ${PACKAGE_TIERS.join(", ")}`,
      });
    }

    const investor = await UserModel.findById(userId).session(session);
    if (!investor) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // ── Create Investment ─────────────────────────────────────────────────────
    const [investment] = await Investment.create(
      [
        {
          userId,
          packageId,
          investmentAmount: Number(investmentAmount),
          txHash,
          addedBy,
          investmentDate: new Date(),
        },
      ],
      { session },
    );

    const isFirstInvestment = !investor.status; // status=false means never invested

    // ── Update investor's own profile ─────────────────────────────────────────
    await UserModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          totalInvestment: investmentAmount,
          currentMonthTotalInvestment: investmentAmount,
          currentMonthBusiness: investmentAmount,
          totalBusiness: investmentAmount,
        },
        $push: { investments: investment._id },
        $set: {
          status: true,
          ...(isFirstInvestment && {
            activeDate: new Date(),
            firstTimeInvestment: investmentAmount,
          }),
        },
      },
      { session },
    );

    // ── Referral bonus → direct sponsor ──────────────────────────────────────
    const referralResult = await payReferralBonus(
      investor,
      investment,
      session,
    );

    // ── Level income → up to 10 binary ancestors ─────────────────────────────
    const levelLog = await distributeLevelIncome(userId, investment, session);

    // ── Propagate business up binary tree ─────────────────────────────────────
    let currentId = userId;
    for (let d = 0; d < 10; d++) {
      const parent = await UserModel.findOne({
        $or: [{ left: currentId }, { right: currentId }],
      }).session(session);
      if (!parent) break;

      await UserModel.findByIdAndUpdate(
        parent._id,
        {
          $inc: {
            totalBusiness: investmentAmount,
            currentMonthBusiness: investmentAmount,
            currentMonthTotalInvestment: investmentAmount,
          },
        },
        { session },
      );
      currentId = parent._id;
    }

    await session.commitTransaction();

    // ── Response ──────────────────────────────────────────────────────────────
    const activationStatus = await checkActivationCondition(userId);

    return res.status(201).json({
      success: true,
      message: "Investment created successfully.",
      data: {
        investment: {
          _id: investment._id,
          amount: investment.investmentAmount,
          dailyROI: investment.dailyROI,
          expectedReturn: investment.investmentAmount * 2,
          cycleEndDate: investment.cycleEndDate,
        },
        referralBonus: referralResult,
        levelIncome: {
          ancestorsChecked: levelLog.length,
          creditedTo: levelLog.filter((l) => l.credited).length,
          skipped: levelLog.filter((l) => l.skipped).length,
          log: levelLog,
        },
        activationStatus: {
          ...activationStatus,
          warning: !activationStatus.isActive
            ? `⚠️ You need ${2 - activationStatus.activeDirectCount} more active direct referral(s) to unlock level income.`
            : "✅ You are fully active. Level income is flowing.",
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("createInvestment error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER: getUserInvestments  — all investments for a user
// ─────────────────────────────────────────────────────────────────────────────
export const getUserInvestments = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;

    const investments = await Investment.find({ userId }).sort({
      investmentDate: -1,
    });

    const summary = {
      totalInvested: investments.reduce((s, i) => s + i.investmentAmount, 0),
      activeInvestments: investments.filter((i) => i.status === "active")
        .length,
      completedInvestments: investments.filter((i) => i.status === "completed")
        .length,
      totalRoiEarned: investments.reduce((s, i) => s + i.totalRoiEarned, 0),
    };

    return res
      .status(200)
      .json({ success: true, data: { investments, summary } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLER: checkUserActivation  — quick check for activation status
// ─────────────────────────────────────────────────────────────────────────────
export const checkUserActivation = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const result = await checkActivationCondition(userId);

    return res.status(200).json({
      success: true,
      data: {
        ...result,
        requiredDirects: 2,
        message: result.isActive
          ? "Active: Level income is enabled."
          : `Inactive: Need ${2 - result.activeDirectCount} more active direct(s) to unlock level income.`,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
