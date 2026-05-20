// import UserModel from "../models/user.model.js";

// const RANKS = [
//   { name: "Star Rank", minBusiness: 3000, roiPercent: 5, capping: 3 },
//   { name: "2 Star Rank", minBusiness: 6000, roiPercent: 10, capping: 4 },
//   { name: "3 Star Rank", minBusiness: 10000, roiPercent: 15, capping: 5 },
//   { name: "4 Star Rank", minBusiness: 25000, roiPercent: 20, capping: 6 },
//   { name: "5 Star Rank", minBusiness: 50000, roiPercent: 25, capping: 7 },
//   { name: "6 Star Rank", minBusiness: 100000, roiPercent: 30, capping: 8 },
//   { name: "7 Star Rank", minBusiness: 250000, roiPercent: 40, capping: 9 },
//   { name: "8 Star Rank", minBusiness: 500000, roiPercent: 50, capping: 10 },
//   { name: "9 Star Rank", minBusiness: 700000, roiPercent: 60, capping: 11 },
//   { name: "10 Star Rank", minBusiness: 1000000, roiPercent: 70, capping: 12 },
//   { name: "11 Star Rank", minBusiness: 2000000, roiPercent: 80, capping: 13 },
//   { name: "12 Star Rank", minBusiness: 5000000, roiPercent: 85, capping: 14 },
//   { name: "13 Star Rank", minBusiness: 10000000, roiPercent: 90, capping: 15 },
//   { name: "14 Star Rank", minBusiness: 30000000, roiPercent: 95, capping: 20 },
//   { name: "15 Star Rank", minBusiness: 50000000, roiPercent: 100, capping: 25 },
// ];

// async function getDirectLegsBusiness(user) {
//   const legs = [];
//   for (let referred of user.referedUsers) {
//     const business =
//       (referred.totalInvestment || 0) + (referred.totalBusiness || 0);
//     legs.push({ user: referred, business });
//   }
//   return legs;
// }

// function getRank(totalTeamBusiness) {
//   let rank = RANKS[0];
//   for (let r of RANKS) {
//     if (totalTeamBusiness >= r.minBusiness) rank = r;
//     else break;
//   }
//   return rank;
// }

// export async function updateAllUsersRank() {
//   const users = await UserModel.find({
//     isVerified: true,
//     "referedUsers.2": { $exists: true },
//   }).populate("referedUsers");

//   console.log(`Total users: ${users.length}`);

//   for (let user of users) {
//     const legs = await getDirectLegsBusiness(user);

//     legs.sort((a, b) => b.business - a.business);

//     const strongLeg = legs[0] || { business: 0, user: null };
//     const secondLeg = legs[1] || { business: 0, user: null };
//     const restLegs = legs.slice(2);

//     const restTotal = restLegs.reduce((sum, l) => sum + l.business, 0);
//     const totalTeamBusiness =
//       strongLeg.business + secondLeg.business + restTotal;
//     const rank = getRank(totalTeamBusiness);
//     // console.log(`\nUser: ${user.username}`);
//     // console.log(`Strong Leg: ${strongLeg.business}`);
//     // console.log(`Second Leg: ${secondLeg.business}`);
//     // console.log(`Rest Legs Total: ${restTotal}`);
//     // console.log(`Total Team Business: ${totalTeamBusiness}`);
//     // console.log(`Rank: ${rank.name}`);
//     // console.log(`Leadership %: ${rank.roiPercent}%`);
//     // console.log(`Capping: ${rank.capping}x`);

//     user.rank = rank.name;
//     user.leadershipPercent = rank.roiPercent;
//     user.leadershipCapping = rank.capping;
//     user.leadershipAchievedDate = new Date();
//     user.leadership = true;
//     await user.save();
//   }
//   console.log("All users updated ✅");
// }

import UserModel from "../models/user.model.js";

const RANKS = [
  { name: "Star Rank", minBusiness: 3000, roiPercent: 5, capping: 3 },
  { name: "2 Star Rank", minBusiness: 6000, roiPercent: 10, capping: 4 },
  { name: "3 Star Rank", minBusiness: 10000, roiPercent: 15, capping: 5 },
  { name: "4 Star Rank", minBusiness: 25000, roiPercent: 20, capping: 6 },
  { name: "5 Star Rank", minBusiness: 50000, roiPercent: 25, capping: 7 },
  { name: "6 Star Rank", minBusiness: 100000, roiPercent: 30, capping: 8 },
];

async function getDirectLegsBusiness(user) {
  const legs = [];

  for (let referred of user.referedUsers) {
    const business =
      (referred.totalInvestment || 0) + (referred.totalBusiness || 0);

    // console.log(
    //   `   ↳ Leg User: ${referred.username} | Investment: ${
    //     referred.totalInvestment || 0
    //   } | Business: ${referred.totalBusiness || 0} | Total: ${business}`,
    // );

    legs.push({ user: referred, business });
  }

  return legs;
}

function calculateRank(legs) {
  legs.sort((a, b) => b.business - a.business);

  const strongLeg = legs[0] || { business: 0 };
  const secondLeg = legs[1] || { business: 0 };
  const restTotal = legs.slice(2).reduce((sum, l) => sum + l.business, 0);

  for (let i = RANKS.length - 1; i >= 0; i--) {
    const rank = RANKS[i];

    const strongNeed = rank.minBusiness * 0.4;
    const secondNeed = rank.minBusiness * 0.3;
    const restNeed = rank.minBusiness * 0.3;

    const strongCounted = Math.min(strongLeg.business, strongNeed);
    const secondCounted = Math.min(secondLeg.business, secondNeed);
    const restCounted = Math.min(restTotal, restNeed);

    const total = strongCounted + secondCounted + restCounted;

    // console.log(`\nChecking Rank → ${rank.name}`);
    // console.log(
    //   `Required Strong: ${strongNeed} | Actual: ${strongLeg.business}`,
    // );
    // console.log(
    //   `Required Second: ${secondNeed} | Actual: ${secondLeg.business}`,
    // );
    // console.log(`Required Rest: ${restNeed} | Actual: ${restTotal}`);
    // console.log(`Counted Total: ${total}`);

    if (total >= rank.minBusiness) {
      return rank;
    }
  }

  return null;
}

export async function updateAllUsersRank() {
  const users = await UserModel.find({
    isVerified: true,
    "referedUsers.2": { $exists: true },
  }).populate("referedUsers");

  // console.log(`\n🚀 Total users to check: ${users.length}`);

  for (let user of users) {
    // console.log("\n========================================");
    // console.log(`👤 Checking User: ${user.username}`);

    const legs = await getDirectLegsBusiness(user);

    const rank = calculateRank(legs);

    if (!rank) {
      console.log("❌ No rank eligible");
      continue;
    }

    // console.log(`🏆 Eligible Rank: ${rank.name}`);

    user.rank = rank.name;
    user.leadershipPercent = rank.roiPercent;
    user.leadershipCapping = rank.capping;
    user.leadershipAchievedDate = new Date();
    user.leadership = true;

    await user.save();

    console.log(`✅ Rank Updated for User: ${user.username}`);
  }

  console.log("\n🎉 All users rank updated successfully");
}
