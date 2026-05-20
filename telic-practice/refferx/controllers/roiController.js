import mongoose from "mongoose";
import Investment, {
  DAILY_ROI_PERCENT,
  ROI_CYCLE_DAYS,
} from "../models/Investment.js";
import Aroi from "../models/Aroi.js";
import UserModel from "../models/UserModel.js";

// ─────────────────────────────────────────────────────────────────────────────
// CRON JOB: processAllDailyROI
// Run this every day at midnight: cron.schedule("0 0 * * *", processAllDailyROI)
//
// Logic:
//  - Find all active investments
//  - For each: increment dayCount, credit dailyROI to user, create Aroi record
//  - After 20 days: mark investment as "completed"
// ─────────────────────────────────────────────────────────────────────────────

export const processAllDailyROI = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  const results = { processed: 0, completed: 0, skipped: 0, errors: [] };

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // All investments that are still active
    const activeInvestments = await Investment.find({
      status: "active",
    }).session(session);

    for (const inv of activeInvestments) {
      try {
        const newDayCount = inv.dayCount + 1;

        // Guard: don't double-credit (idempotency check via unique index on Aroi)
        const alreadyCredited = await Aroi.findOne({
          investmentId: inv._id,
          type: "daily_roi",
          cycleDay: newDayCount,
        }).session(session);

        if (alreadyCredited) {
          results.skipped++;
          continue;
        }

        const roiAmount = inv.dailyROI; // pre-computed at investment creation (5% of principal)

        // ── Create ROI record ─────────────────────────────────────────────────
        await Aroi.create(
          [
            {
              userId: inv.userId,
              investmentId: inv._id,
              type: "daily_roi",
              planName: inv.name,
              investmentAmount: inv.investmentAmount,
              percentage: DAILY_ROI_PERCENT,
              roiAmount,
              creditedOn: today,
              cycleDay: newDayCount,
            },
          ],
          { session },
        );

        // ── Update investment dayCount and totalRoiEarned ─────────────────────
        const isLastDay = newDayCount >= ROI_CYCLE_DAYS;

        await Investment.findByIdAndUpdate(
          inv._id,
          {
            $inc: { dayCount: 1, totalRoiEarned: roiAmount },
            $set: {
              lastRoiCreditedAt: today,
              ...(isLastDay && { status: "completed", activeInvestment: 0 }),
            },
          },
          { session },
        );

        // ── Credit to user wallet ─────────────────────────────────────────────
        await UserModel.findByIdAndUpdate(
          inv.userId,
          {
            $inc: {
              dailyRoi: roiAmount,
              totalRoi: roiAmount,
              currentEarnings: roiAmount,
              totalEarnings: roiAmount,
            },
          },
          { session },
        );

        results.processed++;
        if (isLastDay) results.completed++;
      } catch (err) {
        // Skip this investment but don't abort the whole batch
        results.errors.push({ investmentId: inv._id, error: err.message });
      }
    }

    await session.commitTransaction();
    console.log(`[ROI CRON] Done →`, results);
    return results;
  } catch (error) {
    await session.abortTransaction();
    console.error("[ROI CRON] Fatal error:", error);
    throw error;
  } finally {
    session.endSession();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// API: triggerDailyROI  (admin endpoint — manual trigger / testing)
// ─────────────────────────────────────────────────────────────────────────────
export const triggerDailyROI = async (req, res) => {
  try {
    const results = await processAllDailyROI();
    return res.status(200).json({
      success: true,
      message: "Daily ROI processed.",
      data: results,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// API: getUserROIHistory  — paginated ROI records for a user
// ─────────────────────────────────────────────────────────────────────────────
export const getUserROIHistory = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const filter = { userId };
    if (type) filter.type = type;

    const [records, total] = await Promise.all([
      Aroi.find(filter)
        .sort({ creditedOn: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("investmentId", "investmentAmount name status")
        .populate("sourceUserId", "name username"),
      Aroi.countDocuments(filter),
    ]);

    // Aggregated summary
    const summary = await Aroi.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$type",
          totalEarned: { $sum: "$roiAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        records,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
        summary,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvestmentStatus = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const inv = await Investment.findById(investmentId);
    if (!inv)
      return res
        .status(404)
        .json({ success: false, message: "Investment not found." });

    const daysRemaining = Math.max(0, ROI_CYCLE_DAYS - inv.dayCount);
    const expectedTotal = inv.investmentAmount * 2; // doubles in 20 days
    const progressPercent = (
      (inv.totalRoiEarned / expectedTotal) *
      100
    ).toFixed(1);

    return res.status(200).json({
      success: true,
      data: {
        investmentAmount: inv.investmentAmount,
        dailyROI: inv.dailyROI,
        totalRoiEarned: inv.totalRoiEarned,
        dayCount: inv.dayCount,
        daysRemaining,
        expectedTotal,
        progressPercent: `${progressPercent}%`,
        status: inv.status,
        cycleEndDate: inv.cycleEndDate,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
