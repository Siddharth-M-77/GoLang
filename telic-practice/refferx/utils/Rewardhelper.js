import UserModel from "../models/UserModel.js";

export async function checkAndAwardRewards(user) {
  const result = {
    rewarded: false,
    rewardAmount: 0,
    rewardLevel: null,
    reason: "",
  };

  // Already got the max reward — nothing to do
  if (user.totalTeamRewards >= 15000) {
    result.reason = "Max reward already achieved";
    return result;
  }

  const directCount = user.referedUsers?.length || 0;

  // ─── Get business volume for each direct leg ───────────────────────────────
  // Each direct referral is a "leg". We sort by currentMonthBusiness desc.
  const directUsers = await UserModel.find(
    { _id: { $in: user.referedUsers } },
    {
      _id: 1,
      username: 1,
      currentMonthBusiness: 1,
      currentMonthTotalInvestment: 1,
    },
  ).sort({ currentMonthBusiness: -1 }); // strongest leg first

  const legVolumes = directUsers.map((u) => u.currentMonthBusiness || 0);
  // Pad with zeros so index access is always safe
  while (legVolumes.length < 4) legVolumes.push(0);
  legVolumes.sort((a, b) => b - a); // strongest → weakest

  // ─── Level 3: 4 direct lines, each leg ≥ 50,000 ──────────────────────────
  if (
    user.totalTeamRewards < 15000 &&
    directCount >= 4 &&
    legVolumes[0] >= 50000 &&
    legVolumes[1] >= 50000 &&
    legVolumes[2] >= 50000 &&
    legVolumes[3] >= 50000 &&
    user.lastRewardMilestone < 3
  ) {
    const reward = 15000;
    await UserModel.findByIdAndUpdate(user._id, {
      $inc: {
        teamRewards: reward,
        totalTeamRewards: reward,
        currentEarnings: reward,
        totalEarnings: reward,
      },
      $set: { lastRewardMilestone: 3 },
    });
    return {
      rewarded: true,
      rewardAmount: reward,
      rewardLevel: 3,
      reason: "Level 3 Gold Reward",
    };
  }

  // ─── Level 2: 3 direct lines, legs ≥ 50k / 30k / 20k ────────────────────
  if (
    user.totalTeamRewards < 10000 &&
    directCount >= 3 &&
    legVolumes[0] >= 50000 &&
    legVolumes[1] >= 30000 &&
    legVolumes[2] >= 20000 &&
    user.lastRewardMilestone < 2
  ) {
    const reward = 10000;
    await UserModel.findByIdAndUpdate(user._id, {
      $inc: {
        teamRewards: reward,
        totalTeamRewards: reward,
        currentEarnings: reward,
        totalEarnings: reward,
      },
      $set: { lastRewardMilestone: 2 },
    });
    return {
      rewarded: true,
      rewardAmount: reward,
      rewardLevel: 2,
      reason: "Level 2 Silver Reward",
    };
  }

  // ─── Level 1: 2 direct lines, Left ≥ 25k + Right ≥ 25k ──────────────────
  if (
    user.totalTeamRewards < 5000 &&
    directCount >= 2 &&
    legVolumes[0] >= 25000 &&
    legVolumes[1] >= 25000 &&
    user.lastRewardMilestone < 1
  ) {
    const reward = 5000;
    await UserModel.findByIdAndUpdate(user._id, {
      $inc: {
        teamRewards: reward,
        totalTeamRewards: reward,
        currentEarnings: reward,
        totalEarnings: reward,
      },
      $set: { lastRewardMilestone: 1 },
    });
    return {
      rewarded: true,
      rewardAmount: reward,
      rewardLevel: 1,
      reason: "Level 1 Starter Reward",
    };
  }

  result.reason = "Reward criteria not yet met";
  return result;
}
