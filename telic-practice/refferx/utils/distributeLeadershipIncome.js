import mongoose from "mongoose";
import LeadershipIncome from "../models/Leadershipincome.model.js";
import UserModel from "../models/user.model.js";

// export async function distributeLeadershipIncome(
//   user,
//   roiAmount,
//   level = 1,
//   maxLevels = Infinity,
//   prevDistributedPercent = 0,
// ) {
//   if (!user?.sponserId || level > maxLevels) return;

//   const sponsor = await UserModel.findById(user.sponserId);
//   if (!sponsor || !sponsor.leadershipPercent) return;

//   let sponsorPercent = sponsor.leadershipPercent || 0;

//   // const userRank = user.leadershipPercent || 0;
//   const userRank = Math.max(
//     user.leadershipPercent || 0,
//     prevDistributedPercent,
//   );
//   if (sponsorPercent <= userRank) {
//     return distributeLeadershipIncome(
//       sponsor,
//       roiAmount,
//       level + 1,
//       maxLevels,
//       prevDistributedPercent,
//     );
//   }

//   const eligiblePercent = Math.max(
//     sponsorPercent - Math.max(userRank, prevDistributedPercent),
//     0,
//   );
//   if (eligiblePercent <= 0) {
//     return distributeLeadershipIncome(
//       sponsor,
//       roiAmount,
//       level + 1,
//       maxLevels,
//       prevDistributedPercent,
//     );
//   }

//   const incomeForSponsor = (roiAmount * eligiblePercent) / 100;

//   // Update sponsor earnings
//   const session = await mongoose.startSession();
//   try {
//     await session.withTransaction(async () => {
//       // Update sponsor earnings
//       sponsor.leadershipIncome =
//         (sponsor.leadershipIncome || 0) + incomeForSponsor;
//       sponsor.currentEarnings =
//         (sponsor.currentEarnings || 0) + incomeForSponsor;

//       await sponsor.save({ session });

//       // Save history
//       await LeadershipIncome.create(
//         [
//           {
//             userId: sponsor._id,
//             fromUserId: user._id,
//             percent: eligiblePercent,
//             amount: incomeForSponsor,
//             roiAmount,
//           },
//         ],
//         { session },
//       );
//     });
//   } finally {
//     session.endSession();
//   }
//   // Move to next sponsor in hierarchy
//   await distributeLeadershipIncome(
//     sponsor,
//     roiAmount,
//     level + 1,
//     maxLevels,
//     Math.max(prevDistributedPercent, eligiblePercent),
//   );
// }
export async function distributeLeadershipIncome(
  user,
  roiAmount,
  level = 1,
  maxLevels = Infinity,
  prevDistributedPercent = user.leadershipPercent || 0,
) {
  if (!user?.sponserId || level > maxLevels) return;

  const sponsor = await UserModel.findById(user.sponserId);
  if (!sponsor) return;

  const sponsorPercent = sponsor.leadershipPercent || 0;

  if (sponsorPercent > prevDistributedPercent) {
    const diffPercent = sponsorPercent - prevDistributedPercent;

    const income = (roiAmount * diffPercent) / 100;

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        sponsor.leadershipIncome = (sponsor.leadershipIncome || 0) + income;
        sponsor.currentEarnings = (sponsor.currentEarnings || 0) + income;

        await sponsor.save({ session });

        await LeadershipIncome.create(
          [
            {
              userId: sponsor._id,
              fromUserId: user._id,
              percent: diffPercent,
              amount: income,
              roiAmount,
            },
          ],
          { session },
        );
      });
    } finally {
      session.endSession();
    }

    prevDistributedPercent = sponsorPercent;
  }

  await distributeLeadershipIncome(
    sponsor,
    roiAmount,
    level + 1,
    maxLevels,
    prevDistributedPercent,
  );
}

export default distributeLeadershipIncome;
