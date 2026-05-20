import Investment from "../models/investment.model.js";
import UserModel from "../models/user.model.js";
import Aroi from "../models/roi.model.js";

export const distributeDailyROI = async (req, res) => {
  try {
    const { userId } = req.body;

    // =========================================
    // VALIDATION
    // =========================================
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    // =========================================
    // USER
    // =========================================
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // =========================================
    // SETTINGS
    // =========================================
    const TOTAL_RETURN_PERCENT = 135;
    const TOTAL_DAYS = 30;

    // 135 / 30 = 4.5%
    const DAILY_PERCENT = TOTAL_RETURN_PERCENT / TOTAL_DAYS;

    // =========================================
    // ACTIVE INVESTMENTS
    // =========================================
    const investments = await Investment.find({
      userId,
      status: "active",
      remainingDays: { $gt: 0 },
    });

    // =========================================
    // NO ACTIVE INVESTMENT
    // =========================================
    if (!investments.length) {
      return res.status(400).json({
        success: false,
        message:
          "Your previous investment cycle has been completed successfully. ✨ To continue earning daily rewards and unlock new opportunities, please activate a new investment plan today. 🚀",
      });
    }

    let totalTodayROI = 0;
    let processedCount = 0;

    // =========================================
    // LOOP
    // =========================================
    for (const inv of investments) {
      // =========================================
      // DAILY ROI CHECK
      // ONLY ONCE PER DAY
      // =========================================
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const alreadyGivenToday = await Aroi.findOne({
        investmentId: inv._id,
        creditedOn: { $gte: todayStart },
      });

      if (alreadyGivenToday) {
        continue;
      }

      // =========================================
      // DAILY ROI
      // =========================================
      const dailyRoiAmount = (inv.investmentAmount * DAILY_PERCENT) / 100;

      // =========================================
      // UPDATE INVESTMENT
      // =========================================
      inv.totalRoiEarned += dailyRoiAmount;

      inv.totalReceivedAmount += dailyRoiAmount;

      inv.remainingDays -= 1;

      // =========================================
      // COMPLETE INVESTMENT
      // =========================================
      if (inv.remainingDays <= 0) {
        inv.status = "completed";
        inv.remainingDays = 0;
      }

      await inv.save();

      // =========================================
      // ROI HISTORY
      // =========================================
      await Aroi.create({
        userId: user._id,
        investmentId: inv._id,
        investmentAmount: inv.investmentAmount,
        roiAmount: dailyRoiAmount,
        percentage: DAILY_PERCENT,
        creditedOn: new Date(),
        isClaimed: false,
      });

      // =========================================
      // USER WALLET UPDATE
      // =========================================
      user.dailyRoi += dailyRoiAmount;
      user.totalRoi += dailyRoiAmount;
      user.totalEarnings += dailyRoiAmount;
      user.currentEarnings += dailyRoiAmount;
      user.mainWallet += dailyRoiAmount;

      totalTodayROI += dailyRoiAmount;

      processedCount++;

      // =========================================
      // DIRECT SPONSOR COMMISSION
      // 10%
      // =========================================
      if (user.referredBy) {
        const sponsor = await UserModel.findById(user.referredBy);

        if (sponsor) {
          const sponsorCommission = dailyRoiAmount * 0.1;

          sponsor.referralIncome += sponsorCommission;

          sponsor.totalEarnings += sponsorCommission;

          sponsor.currentEarnings += sponsorCommission;

          sponsor.mainWallet += sponsorCommission;

          await sponsor.save();
        }
      }
    }

    // =========================================
    // SAVE USER
    // =========================================
    await user.save();

    // =========================================
    // ALREADY DISTRIBUTED TODAY
    // =========================================
    if (processedCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Today's ROI has already been credited successfully. 🌟 Please come back tomorrow to receive your next reward cycle. Thank you for being a valued member of our platform. ❤️",
      });
    }

    // =========================================
    // SUCCESS
    // =========================================
    return res.status(200).json({
      success: true,
      message:
        "Congratulations! 🎉 Your daily ROI has been credited successfully to your wallet. Keep growing your earnings and enjoy the power of smart investing with us. 🚀",
      totalTodayROI,
      dailyPercentage: DAILY_PERCENT,
      totalReturnPercentage: TOTAL_RETURN_PERCENT,
      processedInvestments: processedCount,
    });
  } catch (err) {
    console.error("❌ ROI Distribution Error:", err);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while processing your ROI request. Please try again shortly.",
      error: err.message,
    });
  }
};
