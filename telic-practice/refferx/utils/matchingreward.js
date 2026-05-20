import MatchingReward from "../models/matchingreward.model.js";
import UserModel from "../models/user.model.js";
import { getUSDTPriceInINR, getODMPrice } from "../utils/cryptoUtils.js";

const rewardPlans = [
  { amount: 3000, days: 0, bonus: 0, reward: "Domestic Trip" },
  { amount: 6000, days: 0, bonus: 0, reward: "Smart Watch" },
  { amount: 10000, days: 20, bonus: 250, reward: "LED TV" },
  { amount: 25000, days: 40, bonus: 625, reward: "iPhone 15" },
  { amount: 50000, days: 60, bonus: 1250, reward: "10gm Gold" },
  { amount: 100000, days: 90, bonus: 2500, reward: "Royal Enfield" },
  { amount: 250000, days: 120, bonus: 6250, reward: "WagonR" },
  { amount: 500000, days: 150, bonus: 12500, reward: "Thar ROX" },
  { amount: 700000, days: 180, bonus: 17500, reward: "Scorpio N" },
  { amount: 1000000, days: 210, bonus: 25000, reward: "XUV 700" },
  { amount: 2000000, days: 240, bonus: 50000, reward: "Fortuner Legender" },
  { amount: 5000000, days: 270, bonus: 125000, reward: "Defender" },
  { amount: 10000000, days: 300, bonus: 250000, reward: "Land Cruiser" },
  { amount: 30000000, days: 330, bonus: 750000, reward: "Seaface Villa" },
  {
    amount: 50000000,
    days: 365,
    bonus: 1250000,
    reward: "Dream Villa + Mercedes",
  },
];

export const distributeMatchingReward = async (req, res) => {
  try {
    const minBusiness = rewardPlans[0].amount;
    const users = await UserModel.find({
      totalBusiness: { $gte: minBusiness },
    });

    const usdtPriceInINR = await getUSDTPriceInINR();
    const odmPrice = await getODMPrice();

    for (let user of users) {
      // console.log(
      //   `\n📌 Checking user: ${user.username}, Total Business: ${user.totalBusiness}`,
      // );

      const directs = await UserModel.find({ sponserId: user._id }).populate(
        "referedUsers",
      );
      if (!directs.length) {
        // console.log(
        //   `❌ ${user.username} has no directs, skipping reward check`,
        // );
        continue;
      }

      const directsBusiness = directs.map((d) => ({
        id: d._id,
        username: d.username,
        business: (d.totalBusiness || 0) + (d.totalInvestment || 0),
      }));
      directsBusiness.sort((a, b) => b.business - a.business);

      const strongLeg = directsBusiness[0] || { business: 0, username: "N/A" };
      const secondLeg = directsBusiness[1] || { business: 0, username: "N/A" };
      const restLegs = directsBusiness.slice(2);
      const restTotal = restLegs.reduce((sum, d) => sum + d.business, 0);

      for (let plan of rewardPlans) {
        if (user.totalBusiness < plan.amount) {
          continue;
        }

        const strongNeed = plan.amount * 0.4;
        const secondNeed = plan.amount * 0.3;
        const restNeed = plan.amount * 0.3;

        const strongContrib = Math.min(strongLeg.business, strongNeed);
        const secondContrib = Math.min(secondLeg.business, secondNeed);
        const restContrib = Math.min(restTotal, restNeed);

        const totalDistributed = strongContrib + secondContrib + restContrib;

        // console.log(
        //   `\n📊 ${user.username} - Plan ${plan.reward} distribution breakdown:`,
        // );
        // console.log(
        //   `   🔹 Strong leg (${strongLeg.username}): ${strongLeg.business} → ${strongContrib.toFixed(2)}`,
        // );
        // console.log(
        //   `   🔹 Second leg (${secondLeg.username}): ${secondLeg.business} → ${secondContrib.toFixed(2)}`,
        // );
        // console.log(
        //   `   🔹 Rest (${restLegs.length} directs): ${restTotal} → ${restContrib.toFixed(2)}`,
        // );
        // console.log(
        //   `   ✅ Total distributed: ${totalDistributed.toFixed(2)} (Required: ${plan.amount})`,
        // );

        if (totalDistributed < plan.amount) {
          console.log(
            `❌ ${user.username} - Not enough business for reward ${plan.reward}`,
          );
          continue;
        }

        const bonusUSDT = plan.bonus / usdtPriceInINR;
        const bonusODM = (bonusUSDT * usdtPriceInINR) / odmPrice;

        const maxCapping =
          ((user.totalInvestment || 0) * usdtPriceInINR) / odmPrice;
        if ((user.matchingIncome || 0) + bonusODM > maxCapping) {
          console.log(
            `⚠️ ${user.username} reached matching reward capping, skipping reward ${plan.reward}`,
          );
          continue;
        }

        const alreadyRewarded = await MatchingReward.findOne({
          userId: user._id,
          business: plan.amount,
        });

        if (!alreadyRewarded) {
          // console.log(
          //   `✅ Crediting reward ${plan.reward} (${bonusODM.toFixed(2)} ODM) to ${user.username}`,
          // );
          await MatchingReward.create({
            userId: user._id,
            lifeTimeReward: plan.reward,
            amount: bonusODM,
            business: plan.amount,
            status: "completed",
            odmRate: odmPrice,
            usdtPrice: usdtPriceInINR,
          });

          user.matchingIncome = (user.matchingIncome || 0) + bonusODM;
          await user.save();
        } else {
          // console.log(
          //   `⚠️ ${user.username} already received reward ${alreadyRewarded.lifeTimeReward}, skipping reward ${plan.reward}`,
          // );
        }
      }
    }

    console.log("🎉 Matching rewards distributed successfully");
    res
      .status(200)
      .json({ message: "Matching rewards distributed successfully" });
  } catch (error) {
    console.error("❌ Error distributing matching rewards:", error.message);
    res.status(500).json({
      message: "Error distributing matching rewards",
      error: error.message,
    });
  }
};
