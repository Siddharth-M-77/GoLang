import Investment from "../models/investment.model.js";
import LevelIncome from "../models/LevelIncome.model.js";
import UserModel from "../models/user.model.js";
import Level from "../models/level.model.js";
export const LEVEL_PERCENT = [
  { level: 1, percent: 1 },
  { level: 2, percent: 0.9 },
  { level: 3, percent: 0.8 },
  { level: 4, percent: 0.6 },
  { level: 5, percent: 0.3 },
  { level: 6, percent: 0.1 },
  { level: 7, percent: 0.01 },
  { level: 8, percent: 0.01 },
  { level: 9, percent: 0.01 },
  { level: 10, percent: 0.01 },
];

export const distributeLevelIncomeOnRoi = async (
  user,
  roiAmount,
  investmentId,
  usdtPriceInINR,
  odmPrice,
) => {
  try {
    // console.log("💰 ROI Amount for distribution:", roiAmount);
    if (!user?._id || roiAmount <= 0)
      return console.log("Invalid user or ROI amount");

    const levels = await Level.find({}).sort({ level: 1 }).lean();
    if (!levels.length) return console.log("No levels configured");

    const fromUser = await UserModel.findById(user._id).select(
      "username sponserId totalInvestment leadershipCapping",
    );
    if (!fromUser?.sponserId) return console.log("User has no sponsor");

    const investment = await Investment.findById(investmentId);
    if (!investment) return console.log("Investment not found");

    let sponsorId = fromUser.sponserId;
    let levelNumber = 1;

    while (sponsorId && levelNumber <= 25) {
      const sponsor = await UserModel.findById(sponsorId)
        .select(
          "username sponserId isVerified levelIncome mainWallet currentEarnings totalEarnings totalInvestment leadershipCapping hasFullLevelAccess",
        )
        .lean();

      if (!sponsor) {
        console.log(
          `Level ${levelNumber}: Sponsor not found for ID ${sponsorId}`,
        );
        break;
      }

      // console.log(`Level ${levelNumber}: Sponsor ${sponsor.username} found`);
      // ✅ Calculate sponsor max cap in ODM
      const sponsorTotalInvestmentINR =
        (sponsor.totalInvestment || 0) * usdtPriceInINR;
      const maxEarnings =
        ((sponsor.leadershipCapping || 2) * sponsorTotalInvestmentINR) /
        odmPrice;

      // console.log(
      //   `Sponsor ${sponsor.username} totalEarnings: ${sponsor.totalEarnings}, maxEarnings: ${maxEarnings}`,
      // );

      if ((sponsor.totalEarnings || 0) >= maxEarnings) {
        // console.log(
        //   `Sponsor ${sponsor.username} reached max level income cap, skipping level ${levelNumber}`,
        // );
        sponsorId = sponsor.sponserId;
        levelNumber++;
        continue;
      }

      let maxLevelsFromSponsor = 0;

      // 🔥 FULL UNLOCK CASE (500+ single investment)
      if (sponsor.hasFullLevelAccess) {
        maxLevelsFromSponsor = 25;
      } else {
        const directCount = await UserModel.countDocuments({
          sponserId: sponsor._id,
          isVerified: true,
        });

        maxLevelsFromSponsor = Math.min(directCount * 2, 25);
      }

      // apply restriction
      if (levelNumber > maxLevelsFromSponsor) {
        sponsorId = sponsor.sponserId;
        continue;
      }

      const percent = levels.find((l) => l.level === levelNumber)?.percent || 0;
      let income = (roiAmount * percent) / 100;

      if ((sponsor.totalEarnings || 0) + income > maxEarnings) {
        income = maxEarnings - (sponsor.totalEarnings || 0);
        // console.log(
        //   `Capped income to ${income} for sponsor ${sponsor.username}`,
        // );
      }

      if (income <= 0) {
        console.log(`Income <= 0 for sponsor ${sponsor.username}, skipping`);
        sponsorId = sponsor.sponserId;
        levelNumber++;
        continue;
      }

      if (income > 0 && sponsor.isVerified) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const exists = await LevelIncome.findOne({
          userId: sponsor._id,
          fromUserId: fromUser._id,
          investmentId: investment._id,
          level: levelNumber,
          creditedAt: today,
        });

        if (!exists) {
          // console.log(
          //   `Crediting level ${levelNumber} income ${income} to sponsor ${sponsor.username}`,
          // );

          await LevelIncome.create({
            userId: sponsor._id,
            fromUserId: fromUser._id,
            fromUserName: fromUser.username,
            toUserName: sponsor.username,
            investmentId: investment._id,
            amount: income,
            roi: roiAmount,
            level: levelNumber,
            percent,
            creditedAt: today,
          });

          await UserModel.findByIdAndUpdate(sponsor._id, {
            $inc: {
              levelIncome: income,
              totalEarnings: income,
              currentEarnings: income,
              mainWallet: income,
            },
          });
        } else {
          // console.log(
          //   `Level income already exists for sponsor ${sponsor.username}, level ${levelNumber}`,
          // );
        }
      }

      sponsorId = sponsor.sponserId;
      levelNumber++;
    }
  } catch (err) {
    console.error("❌ Level income error:", err);
  }
};
