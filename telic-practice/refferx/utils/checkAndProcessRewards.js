// import UserModel from "../models/user.model.js";
// import RewardHistoryModel from "../models/RewardHistory.model.js";

// const REWARD_TIERS = [
//   {
//     level: 1,
//     name: "Starter",
//     reward: 5000,
//     minDirects: 2,
//     minSelfInvestment: 500,
//     legTargets: [25000, 25000],
//   },
//   {
//     level: 2,
//     name: "Silver",
//     reward: 10000,
//     minDirects: 3,
//     minSelfInvestment: 1000,
//     legTargets: [50000, 30000, 20000],
//   },
//   {
//     level: 3,
//     name: "Gold",
//     reward: 15000,
//     minDirects: 4,
//     minSelfInvestment: 1500,
//     legTargets: [50000, 50000, 50000, 50000],
//   },
// ];

// export async function checkAndProcessRewards(userId) {
//   if (!userId) {
//     return { rewarded: false, reason: "No userId provided" };
//   }

//   const user = await UserModel.findById(userId).populate({
//     path: "referedUsers",
//     select:
//       "currentMonthBusiness currentMonthTotalInvestment isVerified username name",
//   });

//   if (!user) {
//     return { rewarded: false, reason: "User not found" };
//   }

//   // console.log(`[REWARD] 👤 User     : ${user.name || user.username}`);
//   // console.log(`[REWARD]    totalInvestment    : Rs.${user.totalInvestment}`);
//   // console.log(`[REWARD]    lastRewardMilestone: ${user.lastRewardMilestone}`);
//   // console.log(`[REWARD]    carryForward       : Rs.${user.carryForward || 0}`);
//   // console.log(`[REWARD]    totalReferedUsers  : ${user.referedUsers.length}`);

//   const currentMilestone = user.lastRewardMilestone || 0;
//   if (currentMilestone >= 3) {
//     // console.log(`[REWARD] 🏆 Already at Gold — skipping`);
//     return { rewarded: false, reason: "Gold already achieved" };
//   }

//   const tier = REWARD_TIERS[currentMilestone];
//   // console.log(
//   //   `\n[REWARD] 🎯 Checking Level ${tier.level} - ${tier.name} (Reward: Rs.${tier.reward})`,
//   // );
//   // console.log(`[REWARD]    Required directs    : ${tier.minDirects}`);
//   // console.log(`[REWARD]    Required selfInvest : Rs.${tier.minSelfInvestment}`);
//   // console.log(
//   //   `[REWARD]    Required leg targets: [${tier.legTargets.map((t) => `Rs.${t}`).join(", ")}]`,
//   // );

//   const verifiedLegs = user.referedUsers.filter((u) => u.isVerified === true);
//   const unverifiedCount = user.referedUsers.length - verifiedLegs.length;

//   // console.log(
//   //   `\n[REWARD] 🦵 Legs (verified: ${verifiedLegs.length}, skipped unverified: ${unverifiedCount}):`,
//   // );
//   verifiedLegs.forEach((u, i) => {
//     const legVol =
//       (u.currentMonthBusiness || 0) + (u.currentMonthTotalInvestment || 0);
//     // console.log(
//     //   `[REWARD]    Leg ${i + 1}: ${u.name || u.username} → monthBusiness: Rs.${u.currentMonthBusiness || 0} + monthInvestment: Rs.${u.currentMonthTotalInvestment || 0} = Rs.${legVol}`,
//     // );
//   });

//   // ── Build leg data with user references (for history saving) ─────────────
//   const legData = verifiedLegs.map((u) => ({
//     userId: u._id,
//     name: u.name || u.username,
//     volume:
//       (u.currentMonthBusiness || 0) + (u.currentMonthTotalInvestment || 0),
//   }));

//   const legs = legData.map((l) => l.volume).sort((a, b) => b - a);
//   legData.sort((a, b) => b.volume - a.volume);

//   const oldCarryForward = user.carryForward || 0;

//   if (legs.length > 0 && oldCarryForward > 0) {
//     // console.log(
//     //   `[REWARD] ➕ carryForward Rs.${oldCarryForward} added to strongest leg (Rs.${legs[0]} → Rs.${legs[0] + oldCarryForward})`,
//     // );
//     legs[0] += oldCarryForward;
//     legData[0].volume += oldCarryForward;
//   }

//   // console.log(
//   //   `[REWARD] 📊 Sorted leg volumes: [${legs.map((l) => `Rs.${l}`).join(", ")}]`,
//   // );

//   const hasEnoughDirects = legs.length >= tier.minDirects;
//   const hasEnoughSelf = user.totalInvestment >= tier.minSelfInvestment;
//   const legResults = tier.legTargets.map((target, i) => ({
//     leg: i + 1,
//     target,
//     current: legs[i] || 0,
//     met: (legs[i] || 0) >= target,
//   }));
//   const legsAllMet = legResults.every((l) => l.met);

//   // console.log(`\n[REWARD] ✅ Eligibility check:`);
//   // console.log(
//   //   `[REWARD]    Directs    : ${legs.length}/${tier.minDirects} → ${hasEnoughDirects ? "✅ PASS" : "❌ FAIL"}`,
//   // );
//   // console.log(
//   //   `[REWARD]    SelfInvest : Rs.${user.totalInvestment}/${tier.minSelfInvestment} → ${hasEnoughSelf ? "✅ PASS" : "❌ FAIL"}`,
//   // );
//   legResults.forEach((l) => {
//     const status = l.met
//       ? "✅ PASS"
//       : `❌ FAIL (need Rs.${l.target - l.current} more)`;
//     // console.log(
//     //   `[REWARD]    Leg ${l.leg}      : Rs.${l.current}/Rs.${l.target} → ${status}`,
//     // );
//   });

//   const eligible = hasEnoughDirects && hasEnoughSelf && legsAllMet;

//   if (!eligible) {
//     // console.log(`[REWARD] ❌ NOT eligible for ${tier.name}\n`);
//     return { rewarded: false, reason: "Criteria not met", tier: tier.name };
//   }

//   const newCarryForward = tier.legTargets.reduce(
//     (acc, target, i) => acc + Math.max(0, (legs[i] || 0) - target),
//     0,
//   );

//   // console.log(
//   //   `\n[REWARD] 🎉 ELIGIBLE! Crediting Rs.${tier.reward} — Level ${tier.level} ${tier.name}`,
//   // );
//   // console.log(`[REWARD]    New carryForward: Rs.${newCarryForward}`);

//   await RewardHistoryModel.create({
//     userId: user._id,
//     rewardLevel: tier.level,
//     rewardLevelName: tier.name,
//     rewardAmount: tier.reward,
//     selfInvestment: user.totalInvestment,
//     legDetails: tier.legTargets.map((target, i) => ({
//       legUser: legData[i]?.userId || null,
//       name: legData[i]?.name || "N/A",
//       volume: legs[i] || 0,
//       target,
//     })),
//     carryForwardBefore: oldCarryForward,
//     carryForwardAfter: newCarryForward,
//     status: "credited",
//   });

//   // console.log(`[REWARD] 📝 History saved to RewardHistory collection`);

//   // ── Update user ──────────────────────────────────────────────────────────
//   await UserModel.findByIdAndUpdate(userId, {
//     $inc: {
//       teamRewards: tier.reward,
//       totalTeamRewards: tier.reward,
//       currentEarnings: tier.reward,
//       totalEarnings: tier.reward,
//     },
//     $set: {
//       lastRewardMilestone: tier.level,
//       rank: tier.name,
//       carryForward: newCarryForward,
//     },
//   });

//   // console.log(`[REWARD] ✅ Done — rank updated to "${tier.name}"\n`);

//   return {
//     rewarded: true,
//     rewardLevel: tier.level,
//     rewardLevelName: tier.name,
//     rewardAmount: tier.reward,
//     newCarryForward,
//   };
// }

// export async function processAllRewards() {
//   // console.log(`\n${"═".repeat(50)}`);
//   // console.log(`[REWARD CRON] 🚀 Started — ${new Date().toISOString()}`);

//   const allUsers = await UserModel.find({
//     totalInvestment: { $gte: 500 },
//     lastRewardMilestone: { $lt: 3 },
//     "referedUsers.0": { $exists: true },
//   }).select("_id");

//   // console.log(`[REWARD CRON] 👥 Users to check: ${allUsers.length}`);

//   const results = { checked: 0, rewarded: 0, errors: [] };

//   for (const { _id } of allUsers) {
//     try {
//       const result = await checkAndProcessRewards(_id);
//       results.checked++;
//       if (result.rewarded) results.rewarded++;
//     } catch (err) {
//       console.error(`[REWARD CRON] ❌ Error userId ${_id}:`, err.message);
//       results.errors.push({ userId: _id, error: err.message });
//     }
//   }

//   // console.log(`\n[REWARD CRON] 📋 Summary:`);
//   // console.log(`[REWARD CRON]    Checked : ${results.checked}`);
//   // console.log(`[REWARD CRON]    Rewarded: ${results.rewarded}`);
//   // console.log(`[REWARD CRON]    Errors  : ${results.errors.length}`);
//   // console.log(`${"═".repeat(50)}\n`);

//   return results;
// }

import UserModel from "../models/user.model.js";
import RewardHistoryModel from "../models/RewardHistory.model.js";

const REWARD_TIERS = [
  {
    level: 1,
    name: "Starter",
    reward: 5000,
    minDirects: 3,
    minSelfInvestment: 1000,
    legTargets: [25000, 25000, 5000],
  },
  {
    level: 2,
    name: "Silver",
    reward: 10000,
    minDirects: 3,
    minSelfInvestment: 1000,
    legTargets: [50000, 50000, 2000],
  },
  {
    level: 3,
    name: "Gold",
    reward: 15000,
    minDirects: 4,
    minSelfInvestment: 1500,
    legTargets: [50000, 50000, 50000, 30000],
  },
  {
    level: 4,
    name: "Platinum",
    reward: 20000,
    minDirects: 4,
    minSelfInvestment: 2000,
    legTargets: [70000, 70000, 70000, 50000, 50000],
  },
];

export async function checkAndProcessRewards(userId) {
  if (!userId) {
    return { rewarded: false, reason: "No userId provided" };
  }

  const user = await UserModel.findById(userId).populate({
    path: "referedUsers",
    select:
      "currentMonthBusiness currentMonthTotalInvestment isVerified username name",
  });

  if (!user) {
    return { rewarded: false, reason: "User not found" };
  }

  const currentMilestone = user.lastRewardMilestone || 0;
  if (currentMilestone >= 3) {
    return { rewarded: false, reason: "Gold already achieved" };
  }

  const tier = REWARD_TIERS[currentMilestone];

  const verifiedLegs = user.referedUsers.filter((u) => u.isVerified === true);

  // ── Build leg data with user references ─────────────────────────────────
  const legData = verifiedLegs.map((u) => ({
    userId: u._id,
    name: u.name || u.username,
    volume:
      (u.currentMonthBusiness || 0) + (u.currentMonthTotalInvestment || 0),
  }));

  const legs = legData.map((l) => l.volume).sort((a, b) => b - a);
  legData.sort((a, b) => b.volume - a.volume);

  const oldCarryForward = user.carryForward || 0;

  if (legs.length > 0 && oldCarryForward > 0) {
    legs[0] += oldCarryForward;
    legData[0].volume += oldCarryForward;
  }

  // ── Eligibility Checks ──────────────────────────────────────────────────

  const hasEnoughDirects = legs.length >= tier.minDirects;

  // ✅ Current month self investment check (not totalInvestment)
  const currentMonthSelfInvestment = user.currentMonthTotalInvestment || 0;
  const hasEnoughSelf = currentMonthSelfInvestment >= tier.minSelfInvestment;

  // ✅ Current month leg business check (already current month data)
  const legResults = tier.legTargets.map((target, i) => ({
    leg: i + 1,
    target,
    current: legs[i] || 0,
    met: (legs[i] || 0) >= target,
  }));
  const legsAllMet = legResults.every((l) => l.met);

  const eligible = hasEnoughDirects && hasEnoughSelf && legsAllMet;

  if (!eligible) {
    return {
      rewarded: false,
      reason: "Criteria not met",
      tier: tier.name,
      details: {
        directs: {
          required: tier.minDirects,
          have: legs.length,
          pass: hasEnoughDirects,
        },
        selfInvestment: {
          required: tier.minSelfInvestment,
          have: currentMonthSelfInvestment,
          pass: hasEnoughSelf,
        },
        legs: legResults,
      },
    };
  }

  // ── Carry forward calculation ───────────────────────────────────────────
  const newCarryForward = tier.legTargets.reduce(
    (acc, target, i) => acc + Math.max(0, (legs[i] || 0) - target),
    0,
  );

  // ── Save reward history ─────────────────────────────────────────────────
  await RewardHistoryModel.create({
    userId: user._id,
    rewardLevel: tier.level,
    rewardLevelName: tier.name,
    rewardAmount: tier.reward,
    selfInvestment: currentMonthSelfInvestment,
    legDetails: tier.legTargets.map((target, i) => ({
      legUser: legData[i]?.userId || null,
      name: legData[i]?.name || "N/A",
      volume: legs[i] || 0,
      target,
    })),
    carryForwardBefore: oldCarryForward,
    carryForwardAfter: newCarryForward,
    status: "credited",
  });

  await UserModel.findByIdAndUpdate(userId, {
    $inc: {
      teamRewards: tier.reward,
      totalTeamRewards: tier.reward,
      currentEarnings: tier.reward,
      totalEarnings: tier.reward,
    },
    $set: {
      lastRewardMilestone: tier.level,
      rank: tier.name,
      carryForward: newCarryForward,
    },
  });

  return {
    rewarded: true,
    rewardLevel: tier.level,
    rewardLevelName: tier.name,
    rewardAmount: tier.reward,
    newCarryForward,
  };
}

export async function processAllRewards() {
  console.log(`[REWARD CRON] 🚀 Started — ${new Date().toISOString()}`);
  // ✅ Current month self investment check in query filter too
  const allUsers = await UserModel.find({
    currentMonthTotalInvestment: { $gte: 500 },
    lastRewardMilestone: { $lt: 3 },
    "referedUsers.0": { $exists: true },
  }).select("_id");

  console.log(`[REWARD CRON] 👥 Users to check: ${allUsers.length}`);
  const results = { checked: 0, rewarded: 0, errors: [] };
  for (const { _id } of allUsers) {
    try {
      const result = await checkAndProcessRewards(_id);
      results.checked++;
      if (result.rewarded) results.rewarded++;
    } catch (err) {
      console.error(`[REWARD CRON] ❌ Error userId ${_id}:`, err.message);
      results.errors.push({ userId: _id, error: err.message });
    }
  }

  console.log(
    `[REWARD CRON] ✅ Done — Checked: ${results.checked}, Rewarded: ${results.rewarded}, Errors: ${results.errors.length}`,
  );
  return results;
}
