import UserModel from "../models/user.model.js";

const RANKS = [
  { name: "Star Rank", minBusiness: 3000, roiPercent: 5, capping: 3 },
  { name: "2 Star Rank", minBusiness: 6000, roiPercent: 10, capping: 4 },
  { name: "3 Star Rank", minBusiness: 10000, roiPercent: 15, capping: 5 },
  { name: "4 Star Rank", minBusiness: 25000, roiPercent: 20, capping: 6 },
  { name: "5 Star Rank", minBusiness: 50000, roiPercent: 25, capping: 7 },
  { name: "6 Star Rank", minBusiness: 100000, roiPercent: 30, capping: 8 },
  { name: "7 Star Rank", minBusiness: 250000, roiPercent: 40, capping: 9 },
  { name: "8 Star Rank", minBusiness: 500000, roiPercent: 50, capping: 10 },
  { name: "9 Star Rank", minBusiness: 700000, roiPercent: 60, capping: 11 },
  { name: "10 Star Rank", minBusiness: 1000000, roiPercent: 70, capping: 12 },
  { name: "11 Star Rank", minBusiness: 2000000, roiPercent: 80, capping: 13 },
  { name: "12 Star Rank", minBusiness: 5000000, roiPercent: 85, capping: 14 },
  { name: "13 Star Rank", minBusiness: 10000000, roiPercent: 90, capping: 15 },
  { name: "14 Star Rank", minBusiness: 30000000, roiPercent: 95, capping: 20 },
  { name: "15 Star Rank", minBusiness: 50000000, roiPercent: 100, capping: 25 },
];

export async function maintainRankForExistingUsers() {
  const now = new Date();
  const users = await UserModel.find({ leadership: true }).populate(
    "referedUsers",
  );

  for (let user of users) {
    if (!user.leadershipAchievedDate) continue;

    const diffDays = Math.floor(
      (now - new Date(user.leadershipAchievedDate)) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 90) continue;

    const rank = RANKS.find((r) => r.name === user.rank);
    if (!rank) continue;

    const requiredBusiness = rank.minBusiness * 0.2;
    const perLeg = requiredBusiness / 3;

    // Sort legs by business in descending order
    const legs = user.referedUsers.map((ref) => ({
      user: ref,
      business: ref.currentMonthBusiness || 0,
    }));
    legs.sort((a, b) => b.business - a.business);

    const strongLeg = legs[0] || { user: null, business: 0 };
    const secondLeg = legs[1] || { user: null, business: 0 };
    const restLegs = legs.slice(2);
    const restTotal = restLegs.reduce((sum, l) => sum + l.business, 0);

    const isStrongLegOk = strongLeg.business >= perLeg;
    const isSecondLegOk = secondLeg.business >= perLeg;
    const isRestOk = restTotal >= perLeg;

    if (isStrongLegOk && isSecondLegOk && isRestOk) {
      user.leadership = true;
    } else {
      user.leadership = false;
    }

    await user.save();

    console.log(
      `${user.leadership ? "✅ Leadership maintained" : "❌ Leadership removed"} for user ${user.username} (Rank: ${rank.name})`,
    );
  }
}
