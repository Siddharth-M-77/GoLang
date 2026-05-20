// import CTORewards from "../models/CTORewards.js";
// import UserModel from "../models/user.model.js";
// import Investment from "../models/investment.model.js";

// export const distributeCTO = async (req, res) => {
//   try {
//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();

//     const allUsers = await UserModel.find({
//       salaryRank: { $in: ["Platinum", "Diamond"] },
//     });

//     const rankGroups = allUsers.reduce((acc, user) => {
//       const rank = user.salaryRank;
//       if (!acc[rank]) acc[rank] = [];
//       acc[rank].push(user);
//       return acc;
//     }, {});

//     for (const rank of Object.keys(rankGroups)) {
//       const users = rankGroups[rank];
//       const numUsers = users.length;

//       let rankPercentage = rank === "Platinum" ? 0.03 : 0.02;

//       for (const user of users) {
//         const alreadyCredited = await CTORewards.findOne({
//           userId: user._id,
//           creditedOn: {
//             $gte: new Date(currentYear, currentMonth, 1),
//             $lt: new Date(currentYear, currentMonth + 1, 1),
//           },
//         });

//         if (alreadyCredited) {
//           console.log(
//             `⏹ CTO skipped: ${user.username} already received this month`,
//           );
//           continue;
//         }

//         const investments = await Investment.find({
//           userId: user._id,
//           investmentDate: {
//             $gte: new Date(currentYear, currentMonth, 1),
//             $lt: new Date(currentYear, currentMonth + 1, 1),
//           },
//         });

//         const monthBusiness = investments.reduce(
//           (sum, inv) => sum + (inv.investmentAmount || 0),
//           0,
//         );
//         if (monthBusiness <= 0) continue;
//         const ctoAmount = Math.floor(
//           (monthBusiness * rankPercentage) / numUsers,
//         );
//         if (ctoAmount <= 0) continue;
//         user.currentEarnings += ctoAmount;
//         user.CTOIncome = (user.CTOIncome || 0) + ctoAmount;
//         user.totalEarnings += ctoAmount;
//         await CTORewards.create({
//           userId: user._id,
//           amount: ctoAmount,
//           rank,
//           totalUsers: numUsers,
//           creditedOn: now,
//           percent: rankPercentage * 100,
//           monthBusiness,
//         });
//         await user.save();
//         console.log(
//           `✅ CTO credited: ${user.username} got ${ctoAmount} (${rank})`,
//         );
//       }
//     }
//   } catch (error) {
//     console.error("❌ Error distributing CTO:", error.message);
//   }
// };

// import CTORewards from "../models/CTORewards.js";
// import UserModel from "../models/user.model.js";
// import Investment from "../models/investment.model.js";
// import { getUSDTPriceInINR } from "../utils/cryptoUtils.js";
// import { getODMPrice } from "../utils/cryptoUtils.js";

// export const distributeCTO = async () => {
//   try {
//     const now = new Date();
//     const currentMonth = now.getMonth();
//     const currentYear = now.getFullYear();

//     const usdtPriceInINR = await getUSDTPriceInINR();
//     const odmPrice = await getODMPrice();
//     console.log(`Current USDT: ₹${usdtPriceInINR}, ODM: ₹${odmPrice}`);

//     const allUsers = await UserModel.find({
//       salaryRank: { $in: ["Platinum", "Diamond"] },
//     });
//     console.log(`Found ${allUsers.length} users with Platinum/Diamond rank`);

//     const rankGroups = allUsers.reduce((acc, user) => {
//       const rank = user.salaryRank;
//       if (!acc[rank]) acc[rank] = [];
//       acc[rank].push(user);
//       return acc;
//     }, {});

//     for (const rank of Object.keys(rankGroups)) {
//       const users = rankGroups[rank];
//       const numUsers = users.length;
//       const rankPercentage = rank === "Platinum" ? 0.03 : 0.02;

//       for (const user of users) {
//         const alreadyCredited = await CTORewards.findOne({
//           userId: user._id,
//           creditedOn: {
//             $gte: new Date(currentYear, currentMonth, 1),
//             $lt: new Date(currentYear, currentMonth + 1, 1),
//           },
//         });
//         if (alreadyCredited) continue;

//         const investments = await Investment.find({
//           userId: user._id,
//           investmentDate: {
//             $gte: new Date(currentYear, currentMonth, 1),
//             $lt: new Date(currentYear, currentMonth + 1, 1),
//           },
//         });

//         const monthBusinessINR = investments.reduce(
//           (sum, inv) => sum + (inv.usdtAmount || 0) * usdtPriceInINR,
//           0,
//         );
//         if (monthBusinessINR <= 0) continue;

//         const ctoAmountODM =
//           (monthBusinessINR * rankPercentage) / numUsers / odmPrice;

//         if (ctoAmountODM <= 0) continue;

//         user.currentEarnings += ctoAmountODM;
//         user.CTOIncome = (user.CTOIncome || 0) + ctoAmountODM;
//         user.totalEarnings += ctoAmountODM;

//         await CTORewards.create({
//           userId: user._id,
//           amount: ctoAmountODM,
//           rank,
//           totalUsers: numUsers,
//           creditedOn: now,
//           percent: rankPercentage * 100,
//           monthBusiness: monthBusinessINR,
//           odmRate: odmPrice,
//           usdtPrice: usdtPriceInINR,
//         });

//         await user.save();
//         console.log(
//           `✅ CTO credited: ${user.username} got ${ctoAmountODM.toFixed(2)} ODM (${rank})`,
//         );
//       }
//     }

//     console.log("🎉 CTO Distribution Complete");
//   } catch (error) {
//     console.error("❌ Error distributing CTO:", error.message);
//   }
// };
import CTORewards from "../models/CTORewards.js";
import UserModel from "../models/user.model.js";
import Investment from "../models/investment.model.js";
import { getUSDTPriceInINR } from "../utils/cryptoUtils.js";
import { getODMPrice } from "../utils/cryptoUtils.js";

export const distributeCTO = async () => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const usdtPriceInINR = await getUSDTPriceInINR();
    const odmPrice = await getODMPrice();
    console.log(`💰 Current USDT: ₹${usdtPriceInINR}, ODM: ₹${odmPrice}`);

    const allUsers = await UserModel.find({
      salaryRank: { $in: ["Platinum", "Diamond"] },
    });
    console.log(`👥 Found ${allUsers.length} users with Platinum/Diamond rank`);

    const rankGroups = allUsers.reduce((acc, user) => {
      const rank = user.salaryRank;
      if (!acc[rank]) acc[rank] = [];
      acc[rank].push(user);
      return acc;
    }, {});

    for (const rank of Object.keys(rankGroups)) {
      const users = rankGroups[rank];
      const numUsers = users.length;
      const rankPercentage = rank === "Platinum" ? 0.03 : 0.02;

      console.log(
        `\n🏷 Processing rank: ${rank} with ${numUsers} users, percentage: ${rankPercentage * 100}%`,
      );
      for (const user of users) {
        const alreadyCredited = await CTORewards.findOne({
          userId: user._id,
          creditedOn: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        });

        if (alreadyCredited) {
          console.log(
            `⏹ Skipped ${user.username} - already credited this month`,
          );
          continue;
        }
        const investments = await Investment.find({
          investmentDate: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lt: new Date(currentYear, currentMonth + 1, 1),
          },
        });

        const monthBusinessINR = investments.reduce(
          (sum, inv) => sum + (inv.usdtAmount || 0) * usdtPriceInINR,
          0,
        );
        console.log(
          `📊  Monthly Business in INR: ₹${monthBusinessINR.toFixed(2)}`,
        );
        const monthBusinessODM = monthBusinessINR / odmPrice;
        console.log(
          `📊 ${user.username} - Monthly Business: ₹${monthBusinessINR.toFixed(
            2,
          )} / ${monthBusinessODM.toFixed(2)} ODM`,
        );

        if (monthBusinessINR <= 0) {
          console.log(`❌ ${user.username} - no investment this month`);
          continue;
        }

        const ctoAmountODM =
          (monthBusinessINR * rankPercentage) / numUsers / odmPrice;

        if (ctoAmountODM <= 0) {
          console.log(`❌ ${user.username} - calculated CTO reward is 0`);
          continue;
        }

        user.currentEarnings += ctoAmountODM;
        user.CTOIncome = (user.CTOIncome || 0) + ctoAmountODM;
        user.totalEarnings += ctoAmountODM;

        await CTORewards.create({
          userId: user._id,
          amount: ctoAmountODM,
          rank,
          totalUsers: numUsers,
          creditedOn: now,
          percent: rankPercentage * 100,
          monthBusiness: monthBusinessINR,
          odmRate: odmPrice,
          usdtPrice: usdtPriceInINR,
          totalBusinessInr: monthBusinessINR,
        });

        await user.save();
        console.log(
          `✅ CTO credited: ${user.username} got ${ctoAmountODM.toFixed(2)} ODM (${rank})`,
        );
      }
    }

    console.log("\n🎉 CTO Distribution Complete");
  } catch (error) {
    console.error("❌ Error distributing CTO:", error.message);
  }
};
