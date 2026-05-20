// import Investment from "../models/investment.model.js";
// import LevelIncome from "../models/LevelIncome.model.js";
// import UserModel from "../models/user.model.js";

// const LEVEL_PERCENT = [1, 0.9, 0.8, 0.6, 0.3, 0.1, 0.01, 0.01, 0.01, 0.01];
// const MAX_LEVEL = LEVEL_PERCENT.length;
// const TOTAL_DAYS = 20;

// export const runDailyLevelDistribution = async () => {
//   try {
//     console.log("⏰ Level Income Cron Started");

//     const investments = await Investment.find({
//       status: "active",
//     }).lean();

//     if (!investments.length) return;

//     const levelBulk = [];
//     const userBulkMap = {};

//     for (const inv of investments) {
//       // ✅ LevelIncome se check karo kitne din distribute ho chuka hai
//       const distributedDays = await LevelIncome.countDocuments({
//         investmentId: inv._id,
//         level: 1, // level 1 se count lo (har din 1 entry hogi)
//       });

//       // Agar 20 din complete ho gaye toh skip
//       if (distributedDays >= TOTAL_DAYS) continue;

//       let currentUserId = inv.userId;
//       let level = 0;

//       while (level < MAX_LEVEL) {
//         const currentUser = await UserModel.findById(currentUserId)
//           .select("sponserId")
//           .lean();

//         if (!currentUser || !currentUser.sponserId) break;

//         level++;
//         const sponsorId = currentUser.sponserId.toString();

//         const percent = LEVEL_PERCENT[level - 1] || 0;
//         if (percent <= 0) break;

//         const income = (inv.dailyBaseAmount * percent) / 100;
//         if (income <= 0) continue;

//         levelBulk.push({
//           insertOne: {
//             document: {
//               userId: sponsorId,
//               fromUserId: inv.userId,
//               investmentId: inv._id,
//               investmentAmount: inv.investmentAmount,
//               level: level,
//               percent: percent,
//               roi: inv.dailyBaseAmount,
//               amount: income,
//               dayCount: distributedDays + 1,
//               creditedAt: new Date(),
//             },
//           },
//         });

//         if (!userBulkMap[sponsorId]) {
//           userBulkMap[sponsorId] = {
//             $inc: {
//               levelIncome: 0,
//               totalEarnings: 0,
//               currentEarnings: 0,
//               mainWallet: 0,
//             },
//           };
//         }

//         userBulkMap[sponsorId].$inc.levelIncome += income;
//         userBulkMap[sponsorId].$inc.totalEarnings += income;
//         userBulkMap[sponsorId].$inc.currentEarnings += income;
//         userBulkMap[sponsorId].$inc.mainWallet += income;

//         currentUserId = sponsorId;
//       }
//     }

//     await Promise.all([
//       levelBulk.length ? LevelIncome.bulkWrite(levelBulk) : null,
//       Object.keys(userBulkMap).length
//         ? UserModel.bulkWrite(
//             Object.keys(userBulkMap).map((userId) => ({
//               updateOne: {
//                 filter: { _id: userId },
//                 update: userBulkMap[userId],
//               },
//             })),
//           )
//         : null,
//     ]);

//     console.log("✅ Level Income Distributed Successfully");
//   } catch (err) {
//     console.error("❌ Level Income Cron Error:", err);
//   }
// };

import Investment from "../models/investment.model.js";
import LevelIncome from "../models/LevelIncome.model.js";
import UserModel from "../models/user.model.js";

const LEVEL_PERCENT = [1, 0.9, 0.8, 0.6, 0.3, 0.1, 0.01, 0.01, 0.01, 0.01];
const MAX_LEVEL = LEVEL_PERCENT.length;
const TOTAL_DAYS = 20;

/**
 * Helper: Count active directs of a sponsor
 * "Active direct" = user jiska sponserId ye sponsor hai
 * AND jiska koi bhi investment abhi active hai (20 din complete nahi hua)
 */
const getActiveDirectCount = async (sponsorId) => {
  // Step 1: Find all direct referrals of this sponsor
  const directUsers = await UserModel.find({ sponserId: sponsorId })
    .select("_id")
    .lean();

  if (!directUsers.length) return 0;

  const directUserIds = directUsers.map((u) => u._id);

  // Step 2: Check which of these directs have at least one active investment
  // Active = investment status "active" AND 20 days distribution not yet complete
  const activeDirectIds = new Set();

  for (const uid of directUserIds) {
    const activeInvestment = await Investment.findOne({
      userId: uid,
      status: "active",
    }).lean();

    if (activeInvestment) {
      // Verify ki 20 days complete nahi hua hai
      const distributedDays = await LevelIncome.countDocuments({
        investmentId: activeInvestment._id,
        level: 1,
      });

      if (distributedDays < TOTAL_DAYS) {
        activeDirectIds.add(uid.toString());
      }
    }
  }

  return activeDirectIds.size;
};

export const runDailyLevelDistribution = async () => {
  try {
    console.log("⏰ Level Income Cron Started");

    const investments = await Investment.find({
      status: "active",
    }).lean();

    if (!investments.length) return;

    const levelBulk = [];
    const userBulkMap = {};

    // Cache: sponsor ke active direct count ko cache karo taaki baar baar DB hit na ho
    const activeDirectCache = {};

    for (const inv of investments) {
      // ✅ LevelIncome se check karo kitne din distribute ho chuka hai
      const distributedDays = await LevelIncome.countDocuments({
        investmentId: inv._id,
        level: 1,
      });

      // Agar 20 din complete ho gaye toh skip
      if (distributedDays >= TOTAL_DAYS) {
        // Optional: Mark investment as completed
        await Investment.updateOne(
          { _id: inv._id },
          { $set: { status: "completed" } },
        );
        continue;
      }

      let currentUserId = inv.userId;
      let level = 0;

      while (level < MAX_LEVEL) {
        const currentUser = await UserModel.findById(currentUserId)
          .select("sponserId")
          .lean();

        if (!currentUser || !currentUser.sponserId) break;

        level++;
        const sponsorId = currentUser.sponserId.toString();

        // ✅ Active Direct Condition Check
        // Sponsor ko level N se income tabhi milegi jab uske paas N active directs hon
        if (!activeDirectCache[sponsorId]) {
          activeDirectCache[sponsorId] = await getActiveDirectCount(sponsorId);
        }

        const activeDirects = activeDirectCache[sponsorId];

        // Agar sponsor ke active directs current level se kam hain, toh skip this sponsor
        // But upar chain me aage bhi check karna hai, toh break nahi karenge — sirf skip
        if (activeDirects < level) {
          currentUserId = sponsorId;
          continue; // Is sponsor ko income nahi milegi, but uske upar wale ko mil sakti hai
        }

        const percent = LEVEL_PERCENT[level - 1] || 0;
        if (percent <= 0) {
          currentUserId = sponsorId;
          continue;
        }

        const income = (inv.dailyBaseAmount * percent) / 100;
        if (income <= 0) {
          currentUserId = sponsorId;
          continue;
        }

        levelBulk.push({
          insertOne: {
            document: {
              userId: sponsorId,
              fromUserId: inv.userId,
              investmentId: inv._id,
              investmentAmount: inv.investmentAmount,
              level: level,
              percent: percent,
              roi: inv.dailyBaseAmount,
              amount: income,
              dayCount: distributedDays + 1,
              creditedAt: new Date(),
            },
          },
        });

        if (!userBulkMap[sponsorId]) {
          userBulkMap[sponsorId] = {
            $inc: {
              levelIncome: 0,
              totalEarnings: 0,
              currentEarnings: 0,
              mainWallet: 0,
            },
          };
        }

        userBulkMap[sponsorId].$inc.levelIncome += income;
        userBulkMap[sponsorId].$inc.totalEarnings += income;
        userBulkMap[sponsorId].$inc.currentEarnings += income;
        userBulkMap[sponsorId].$inc.mainWallet += income;

        currentUserId = sponsorId;
      }
    }

    await Promise.all([
      levelBulk.length ? LevelIncome.bulkWrite(levelBulk) : null,
      Object.keys(userBulkMap).length
        ? UserModel.bulkWrite(
            Object.keys(userBulkMap).map((userId) => ({
              updateOne: {
                filter: { _id: userId },
                update: userBulkMap[userId],
              },
            })),
          )
        : null,
    ]);

    console.log("✅ Level Income Distributed Successfully");
  } catch (err) {
    console.error("❌ Level Income Cron Error:", err);
  }
};
