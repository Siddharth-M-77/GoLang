import LeadershipIncome from "../models/Leadershipincome.model.js";
import UserModel from "../models/user.model.js";

export async function distributeLeadershipIncome(
  user,
  roiAmount,
  level = 1,
  maxLevels = Infinity,
  prevDistributedPercent = 0,
) {
  if (!user?.sponserId || level > maxLevels) return;

  // Fetch sponsor
  const sponsor = await UserModel.findById(user.sponserId);
  if (!sponsor || !sponsor.leadershipPercent) return;

  let sponsorPercent = sponsor.leadershipPercent || 0;

  // Rule: if sponsor rank <= user rank => skip
  const userRank = user.leadershipPercent || 0;
  if (sponsorPercent <= userRank) {
    // No leadership income for this sponsor
    return distributeLeadershipIncome(
      sponsor,
      roiAmount,
      level + 1,
      maxLevels,
      prevDistributedPercent,
    );
  }

  // Differential percent calculation
  const eligiblePercent = Math.max(
    sponsorPercent - Math.max(userRank, prevDistributedPercent),
    0,
  );
  if (eligiblePercent <= 0) {
    return distributeLeadershipIncome(
      sponsor,
      roiAmount,
      level + 1,
      maxLevels,
      prevDistributedPercent,
    );
  }

  const incomeForSponsor = (roiAmount * eligiblePercent) / 100;

  // Update sponsor earnings
  sponsor.leadershipIncome = (sponsor.leadershipIncome || 0) + incomeForSponsor;
  sponsor.currentEarnings = (sponsor.currentEarnings || 0) + incomeForSponsor;

  await sponsor.save();

  // Save history
  await LeadershipIncome.create({
    userId: sponsor._id,
    fromUserId: user._id,
    percent: eligiblePercent,
    amount: incomeForSponsor,
    roiAmount,
  });

  // Move to next sponsor in hierarchy
  await distributeLeadershipIncome(
    sponsor,
    roiAmount,
    level + 1,
    maxLevels,
    Math.max(prevDistributedPercent, eligiblePercent),
  );
}

export default distributeLeadershipIncome;
