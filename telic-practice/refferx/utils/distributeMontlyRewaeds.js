// import MonthlyRewards from "../models/monthlyRewards.js";
// import UserModel from "../models/user.model.js";
// import { getUSDTPriceInINR, getODMPrice } from "../utils/cryptoUtils.js";

// const salaryLevels = [
//   { business: 30000, reward: 200, title: "Bronze", duration: 50 },
//   { business: 150000, reward: 1000, title: "Silver", duration: 100 },
//   { business: 750000, reward: 5000, title: "Gold", duration: 200 },
//   { business: 4000000, reward: 25000, title: "Platinum", duration: 300 },
//   { business: 20000000, reward: 100000, title: "Diamond", duration: Infinity },
// ];

// export const distributeMontlyRewards = async () => {
//   try {
//     const users = await UserModel.find({
//       totalBusiness: { $gte: 30000 },
//     });
//     const now = new Date();
//     const usdtPriceInINR = await getUSDTPriceInINR();
//     const odmPrice = await getODMPrice();
//     for (const user of users) {
//       const userBusiness = user.totalBusiness || 0;
//       let matchedLevel = null;
//       for (const level of salaryLevels) {
//         if (userBusiness >= level.business) {
//           matchedLevel = level;
//         }
//       }
//       if (!matchedLevel) continue;
//       if (user.createdAt) {
//         const daysSinceJoining = Math.floor(
//           (now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24),
//         );

//         if (daysSinceJoining > matchedLevel.duration) {
//           continue;
//         }
//       }
//       if (user.rank !== matchedLevel.title) {
//         user.rank = matchedLevel.title;
//       }
//       if (!user.salaryStartDate) {
//         user.salaryStartDate = now;
//         user.salaryMonthsPaid = 0;
//         user.salaryLevel = matchedLevel.title;
//       }

//       if (user.salaryLevel !== matchedLevel.title) {
//         user.salaryLevel = matchedLevel.title;
//         user.salaryStartDate = now;
//         user.salaryMonthsPaid = 0;
//       }

//       if (user.salaryMonthsPaid >= 12) {
//         await user.save();
//         continue;
//       }

//       const lastDate = user.lastSalaryPaidDate;
//       if (lastDate) {
//         const last = new Date(lastDate);
//         const isSameMonth =
//           last.getMonth() === now.getMonth() &&
//           last.getFullYear() === now.getFullYear();

//         if (isSameMonth) {
//           await user.save();
//           continue;
//         }
//       }
//       const rewardUSDT = matchedLevel.reward;

//       const rewardODM = (rewardUSDT * usdtPriceInINR) / odmPrice;

//       await UserModel.findByIdAndUpdate(user._id, {
//         $inc: {
//           totalMonthlyRewards: rewardODM,
//           currentEarnings: rewardODM,
//           totalEarnings: rewardODM,
//           salary: rewardODM,
//           salaryMonthsPaid: 1,
//         },
//         $set: {
//           monthlyRewards: rewardODM,
//           lastSalaryPaidDate: now,
//           salaryLevel: matchedLevel.title,
//           salaryRank: matchedLevel.title,
//         },
//       });

//       await MonthlyRewards.create({
//         userId: user._id,
//         usdtAmount: rewardUSDT,
//         odmAmount: rewardODM,
//         creditedOn: now,
//         rewardTier: matchedLevel.title,
//         totalBusiness: userBusiness,
//         monthCount: user.salaryMonthsPaid + 1,
//         usdtPrice: usdtPriceInINR,
//         odmRate: odmPrice,
//       });

//       console.log(
//         `✅ ${user.username} got ${rewardODM} ODM (${matchedLevel.title})`,
//       );
//     }

//     console.log("🎉 Salary + Rank updated");
//   } catch (error) {
//     console.error("❌ Error:", error.message);
//   }
// };

// import MonthlyRewards from "../models/monthlyRewards.js";
// import UserModel from "../models/user.model.js";
// import { getUSDTPriceInINR, getODMPrice } from "../utils/cryptoUtils.js";

// const salaryLevels = [
//   { business: 10, reward: 200, title: "Bronze", duration: 50 },
//   { business: 150000, reward: 1000, title: "Silver", duration: 100 },
//   { business: 750000, reward: 5000, title: "Gold", duration: 200 },
//   { business: 4000000, reward: 25000, title: "Platinum", duration: 300 },
//   { business: 20000000, reward: 100000, title: "Diamond", duration: Infinity },
// ];

// export const distributeMontlyRewards = async () => {
//   try {
//     const users = await UserModel.find({ totalBusiness: { $gte: 30000 } });
//     console.log(`Total eligible users for monthly rewards: ${users.length}`);

//     const now = new Date();
//     const usdtPriceInINR = await getUSDTPriceInINR();
//     const odmPrice = await getODMPrice();

//     for (const user of users) {
//       const matchedLevel = salaryLevels
//         .slice()
//         .reverse()
//         .find(
//           (level) =>
//             user.totalBusiness + (user.totalInvestment || 0) >= level.business,
//         );
//       if (!matchedLevel) continue;

//       const directs = await UserModel.find({ sponserId: user._id });
//       if (!directs.length) {
//         console.log(`❌ ${user.username} has no directs`);
//         continue;
//       }

//       const directsBusiness = directs.map((d) => ({
//         id: d._id,
//         username: d.username,
//         business: (d.totalBusiness || 0) + (d.totalInvestment || 0),
//       }));

//       directsBusiness.sort((a, b) => b.business - a.business);

//       // Calculate distribution percentages
//       const strongLeg = directsBusiness[0] || { business: 0 };
//       const secondLeg = directsBusiness[1] || { business: 0 };
//       const restLegs = directsBusiness.slice(2);

//       const strongLegContribution = strongLeg.business * 0.4;
//       const secondLegContribution = secondLeg.business * 0.3;
//       const restTotalBusiness = restLegs.reduce(
//         (sum, d) => sum + d.business,
//         0,
//       );
//       const restContribution = restTotalBusiness * 0.3;

//       const totalDistributed =
//         strongLegContribution + secondLegContribution + restContribution;

//       // Strong console logging
//       // console.log(`\n📊 ${user.username} - Business distribution breakdown:`);
//       // console.log(
//       //   `   🔹 Strong leg (${strongLeg.username || "N/A"}): ${strongLeg.business} → ${strongLegContribution.toFixed(
//       //     2,
//       //   )}`,
//       // );
//       // console.log(
//       //   `   🔹 Second leg (${secondLeg.username || "N/A"}): ${secondLeg.business} → ${secondLegContribution.toFixed(
//       //     2,
//       //   )}`,
//       // );
//       // console.log(
//       //   `   🔹 Rest (${restLegs.length} directs): ${restTotalBusiness} → ${restContribution.toFixed(
//       //     2,
//       //   )}`,
//       // );
//       // console.log(
//       //   `   ✅ Total distributed business: ${totalDistributed} (Rank needed: ${matchedLevel.business})`,
//       // );

//       if (totalDistributed < matchedLevel.business) {
//         console.log(
//           `❌ ${user.username} - Not enough direct business for rank`,
//         );
//         continue;
//       }

//       // Update user rank and salary
//       if (user.rank !== matchedLevel.title) user.rank = matchedLevel.title;
//       if (!user.salaryStartDate) {
//         user.salaryStartDate = now;
//         user.salaryMonthsPaid = 0;
//         user.salaryLevel = matchedLevel.title;
//       }

//       if (user.salaryLevel !== matchedLevel.title) {
//         user.salaryLevel = matchedLevel.title;
//         user.salaryStartDate = now;
//         user.salaryMonthsPaid = 0;
//       }

//       if (user.salaryMonthsPaid >= 12) {
//         await user.save();
//         continue;
//       }

//       const rewardUSDT = matchedLevel.reward;
//       const rewardODM = (rewardUSDT * usdtPriceInINR) / odmPrice;

//       await UserModel.findByIdAndUpdate(user._id, {
//         $inc: {
//           totalMonthlyRewards: rewardODM,
//           currentEarnings: rewardODM,
//           totalEarnings: rewardODM,
//           salary: rewardODM,
//           salaryMonthsPaid: 1,
//         },
//         $set: {
//           monthlyRewards: rewardODM,
//           lastSalaryPaidDate: now,
//           salaryLevel: matchedLevel.title,
//           salaryRank: matchedLevel.title,
//         },
//       });

//       await MonthlyRewards.create({
//         userId: user._id,
//         usdtAmount: rewardUSDT,
//         odmAmount: rewardODM,
//         creditedOn: now,
//         rewardTier: matchedLevel.title,
//         totalBusiness: totalDistributed,
//         monthCount: user.salaryMonthsPaid + 1,
//         usdtPrice: usdtPriceInINR,
//         odmRate: odmPrice,
//       });

//       console.log(
//         `✅ ${user.username} got ${rewardODM.toFixed(2)} ODM (${matchedLevel.title})`,
//       );
//     }

//     console.log("\n🎉 Salary + Rank updated");
//   } catch (error) {
//     console.error("❌ Error:", error.message);
//   }
// };

// import MonthlyRewards from "../models/monthlyRewards.js";
// import UserModel from "../models/user.model.js";
// import { getUSDTPriceInINR, getODMPrice } from "../utils/cryptoUtils.js";

// const salaryLevels = [
//   { business: 30000, reward: 200, title: "Bronze", duration: 50 },
//   { business: 150000, reward: 1000, title: "Silver", duration: 100 },
//   { business: 750000, reward: 5000, title: "Gold", duration: 200 },
//   { business: 4000000, reward: 25000, title: "Platinum", duration: 300 },
//   { business: 20000000, reward: 100000, title: "Diamond", duration: Infinity },
// ];
// export const distributeMontlyRewards = async () => {
//   try {
//     const users = await UserModel.find({ totalBusiness: { $gte: 30000 } });
//     console.log(`Total eligible users for monthly rewards: ${users.length}`);

//     const now = new Date();
//     const usdtPriceInINR = await getUSDTPriceInINR();
//     const odmPrice = await getODMPrice();

//     for (const user of users) {
//       const matchedLevel = salaryLevels
//         .slice()
//         .reverse()
//         .find(
//           (level) =>
//             user.totalBusiness + (user.totalInvestment || 0) >= level.business,
//         );
//       if (!matchedLevel) continue;

//       const directs = await UserModel.find({ sponserId: user._id });
//       if (!directs.length) {
//         console.log(`❌ ${user.username} has no directs`);
//         continue;
//       }

//       // Calculate total business for each direct
//       const directsBusiness = directs.map((d) => ({
//         id: d._id,
//         username: d.username,
//         business: (d.totalBusiness || 0) + (d.totalInvestment || 0),
//       }));

//       // Sort descending by business
//       directsBusiness.sort((a, b) => b.business - a.business);

//       // Calculate exact contributions to meet required rank
//       const requiredBusiness = matchedLevel.business;

//       const strongLegNeed = requiredBusiness * 0.4;
//       const secondLegNeed = requiredBusiness * 0.3;
//       const restNeed = requiredBusiness * 0.3;

//       const strongLeg = directsBusiness[0] || { business: 0, username: "N/A" };
//       const secondLeg = directsBusiness[1] || { business: 0, username: "N/A" };
//       const restLegs = directsBusiness.slice(2);

//       const strongLegContribution = Math.min(strongLeg.business, strongLegNeed);
//       const secondLegContribution = Math.min(secondLeg.business, secondLegNeed);

//       const restTotalAvailable = restLegs.reduce(
//         (sum, d) => sum + d.business,
//         0,
//       );
//       const restContribution = Math.min(restTotalAvailable, restNeed);

//       const totalDistributed =
//         strongLegContribution + secondLegContribution + restContribution;

//       // Detailed console for debugging
//       console.log(`\n📊 ${user.username} - Business distribution breakdown:`);
//       console.log(
//         `   🔹 Strong leg (${strongLeg.username}): ${strongLeg.business} → ${strongLegContribution.toFixed(
//           2,
//         )}`,
//       );
//       console.log(
//         `   🔹 Second leg (${secondLeg.username}): ${secondLeg.business} → ${secondLegContribution.toFixed(
//           2,
//         )}`,
//       );
//       console.log(
//         `   🔹 Rest (${restLegs.length} directs): ${restTotalAvailable} → ${restContribution.toFixed(
//           2,
//         )}`,
//       );
//       console.log(
//         `   ✅ Total distributed business: ${totalDistributed.toFixed(
//           2,
//         )} (Rank needed: ${requiredBusiness})`,
//       );

//       if (totalDistributed < requiredBusiness) {
//         console.log(
//           `❌ ${user.username} - Not enough direct business for rank`,
//         );
//         continue;
//       }

//       // Update user rank and salary
//       if (user.rank !== matchedLevel.title) user.rank = matchedLevel.title;
//       if (!user.salaryStartDate) {
//         user.salaryStartDate = now;
//         user.salaryMonthsPaid = 0;
//         user.salaryLevel = matchedLevel.title;
//       }

//       if (user.salaryLevel !== matchedLevel.title) {
//         user.salaryLevel = matchedLevel.title;
//         user.salaryStartDate = now;
//         user.salaryMonthsPaid = 0;
//       }

//       if (user.salaryMonthsPaid >= 12) {
//         await user.save();
//         continue;
//       }

//       const rewardUSDT = matchedLevel.reward;
//       const rewardODM = (rewardUSDT * usdtPriceInINR) / odmPrice;

//       await UserModel.findByIdAndUpdate(user._id, {
//         $inc: {
//           totalMonthlyRewards: rewardODM,
//           currentEarnings: rewardODM,
//           totalEarnings: rewardODM,
//           salary: rewardODM,
//           salaryMonthsPaid: 1,
//         },
//         $set: {
//           monthlyRewards: rewardODM,
//           lastSalaryPaidDate: now,
//           salaryLevel: matchedLevel.title,
//           salaryRank: matchedLevel.title,
//         },
//       });

//       await MonthlyRewards.create({
//         userId: user._id,
//         usdtAmount: rewardUSDT,
//         odmAmount: rewardODM,
//         creditedOn: now,
//         rewardTier: matchedLevel.title,
//         totalBusiness: totalDistributed,
//         monthCount: user.salaryMonthsPaid + 1,
//         usdtPrice: usdtPriceInINR,
//         odmRate: odmPrice,
//       });

//       console.log(
//         `✅ ${user.username} got ${rewardODM.toFixed(2)} ODM (${matchedLevel.title})`,
//       );
//     }

//     console.log("\n🎉 Salary + Rank updated");
//   } catch (error) {
//     console.error("❌ Error:", error.message);
//   }
// };

import MonthlyRewards from "../models/monthlyRewards.js";
import UserModel from "../models/user.model.js";
import { getUSDTPriceInINR, getODMPrice } from "../utils/cryptoUtils.js";

const salaryLevels = [
  { business: 10000, reward: 200, title: "Bronze", duration: 50 },
  { business: 150000, reward: 1000, title: "Silver", duration: 100 },
  { business: 750000, reward: 5000, title: "Gold", duration: 200 },
  { business: 4000000, reward: 25000, title: "Platinum", duration: 300 },
  { business: 20000000, reward: 100000, title: "Diamond", duration: Infinity },
];

export const distributeMontlyRewards = async () => {
  try {
    const users = await UserModel.find({ totalBusiness: { $gte: 30000 } });
    console.log(`Total eligible users for monthly rewards: ${users.length}`);

    const now = new Date();
    const usdtPriceInINR = await getUSDTPriceInINR();
    const odmPrice = await getODMPrice();

    for (const user of users) {
      const matchedLevel = salaryLevels
        .slice()
        .reverse()
        .find(
          (level) =>
            (user.totalBusiness || 0) + (user.totalInvestment || 0) >=
            level.business,
        );
      if (!matchedLevel) continue;

      const directs = await UserModel.find({ sponserId: user._id }).populate(
        "referedUsers",
      );
      if (!directs.length) {
        console.log(`❌ ${user.username} has no directs`);
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

      const requiredBusiness = matchedLevel.business;

      // 1. Check new business condition if user already got salary
      if (user.salaryLevel === matchedLevel.title && user.lastSalaryPaidDate) {
        const requiredNewBusiness = requiredBusiness * 0.1; // 10%
        const perLegRequired = requiredNewBusiness / 3;

        const strongLegNew = Math.min(strongLeg.business, perLegRequired);
        const secondLegNew = Math.min(secondLeg.business, perLegRequired);
        const restTotalAvailable = restLegs.reduce(
          (sum, d) => sum + d.business,
          0,
        );
        const restNew = Math.min(restTotalAvailable, perLegRequired);

        console.log(
          `🔹 ${user.username} - Checking 10% new business:`,
          `Strong: ${strongLegNew.toFixed(2)}, Second: ${secondLegNew.toFixed(
            2,
          )}, Rest: ${restNew.toFixed(2)}, Required per leg: ${perLegRequired.toFixed(2)}`,
        );

        if (
          strongLegNew < perLegRequired ||
          secondLegNew < perLegRequired ||
          restNew < perLegRequired
        ) {
          console.log(
            `❌ ${user.username} - Not enough new business for next salary`,
          );
          continue;
        }
      }

      // 2. Calculate distribution for rank eligibility
      const strongLegNeed = requiredBusiness * 0.4;
      const secondLegNeed = requiredBusiness * 0.3;
      const restNeed = requiredBusiness * 0.3;

      const strongLegContribution = Math.min(strongLeg.business, strongLegNeed);
      const secondLegContribution = Math.min(secondLeg.business, secondLegNeed);
      const restTotalAvailable = restLegs.reduce(
        (sum, d) => sum + d.business,
        0,
      );
      const restContribution = Math.min(restTotalAvailable, restNeed);

      const totalDistributed =
        strongLegContribution + secondLegContribution + restContribution;

      console.log(`\n📊 ${user.username} - Business distribution breakdown:`);
      console.log(
        `   🔹 Strong leg (${strongLeg.username}): ${strongLeg.business} → ${strongLegContribution.toFixed(
          2,
        )}`,
      );
      console.log(
        `   🔹 Second leg (${secondLeg.username}): ${secondLeg.business} → ${secondLegContribution.toFixed(
          2,
        )}`,
      );
      console.log(
        `   🔹 Rest (${restLegs.length} directs): ${restTotalAvailable} → ${restContribution.toFixed(
          2,
        )}`,
      );
      console.log(
        `   ✅ Total distributed business: ${totalDistributed.toFixed(
          2,
        )} (Rank needed: ${requiredBusiness})`,
      );

      if (totalDistributed < requiredBusiness) {
        console.log(
          `❌ ${user.username} - Not enough direct business for rank`,
        );
        continue;
      }

      // 3. Update user rank and salary
      if (user.rank !== matchedLevel.title) user.rank = matchedLevel.title;
      if (!user.salaryStartDate) {
        user.salaryStartDate = now;
        user.salaryMonthsPaid = 0;
        user.salaryLevel = matchedLevel.title;
      }

      if (user.salaryLevel !== matchedLevel.title) {
        user.salaryLevel = matchedLevel.title;
        user.salaryStartDate = now;
        user.salaryMonthsPaid = 0;
      }

      if (user.salaryMonthsPaid >= 12) {
        await user.save();
        continue;
      }

      const rewardUSDT = matchedLevel.reward;
      const rewardODM = (rewardUSDT * usdtPriceInINR) / odmPrice;

      await UserModel.findByIdAndUpdate(user._id, {
        $inc: {
          totalMonthlyRewards: rewardODM,
          currentEarnings: rewardODM,
          totalEarnings: rewardODM,
          salary: rewardODM,
          salaryMonthsPaid: 1,
        },
        $set: {
          monthlyRewards: rewardODM,
          lastSalaryPaidDate: now,
          salaryLevel: matchedLevel.title,
          salaryRank: matchedLevel.title,
        },
      });
      await MonthlyRewards.create({
        userId: user._id,
        usdtAmount: rewardUSDT,
        odmAmount: rewardODM,
        creditedOn: now,
        rewardTier: matchedLevel.title,
        totalBusiness: totalDistributed,
        monthCount: user.salaryMonthsPaid + 1,
        usdtPrice: usdtPriceInINR,
        odmRate: odmPrice,
      });
      console.log(
        `✅ ${user.username} got ${rewardODM.toFixed(2)} ODM (${matchedLevel.title})`,
      );
    }

    console.log("\n🎉 Salary + Rank updated");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};
