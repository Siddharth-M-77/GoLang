// import UserModel from "../models/user.model.js";
// import Investment from "../models/investment.model.js";

// export const canUserWithdraw = async (userId) => {
//   const userInvestment = await Investment.findOne({
//     userId: userId,
//     status: "active",
//     remainingDays: { $gt: 0 },
//   }).lean();

//   if (!userInvestment) {
//     return {
//       allowed: false,
//       message: "You don't have any active investment.",
//     };
//   }

//   // Step 2: Find all direct referrals of this user
//   const directUsers = await UserModel.find({ sponserId: userId })
//     .select("_id")
//     .lean();

//   if (directUsers.length < 2) {
//     return {
//       allowed: false,
//       message: `You need at least 2 active directs to withdraw. You have ${directUsers.length} direct(s).`,
//     };
//   }

//   // Step 3: Check kitne directs ke paas active investment hai (remainingDays > 0)
//   const directUserIds = directUsers.map((u) => u._id);

//   const activeDirectCount = await Investment.distinct("userId", {
//     userId: { $in: directUserIds },
//     status: "active",
//     remainingDays: { $gt: 0 },
//   });

//   if (activeDirectCount.length >= 2) {
//     return { allowed: true };
//   }

//   return {
//     allowed: false,
//     message: `You need at least 2 active directs to withdraw. You have ${activeDirectCount.length} active direct(s).`,
//   };
// };

import UserModel from "../models/user.model.js";
import Investment from "../models/investment.model.js";

export const canUserWithdraw = async (userId) => {
  // Step 1: Tera khud ka active investment check
  const userInvestment = await Investment.findOne({
    userId: userId,
    status: "active",
    remainingDays: { $gt: 0 },
  }).lean();

  if (!userInvestment) {
    return {
      allowed: false,
      message: "You don't have any active investment.",
    };
  }

  // Step 2: Tera khud ka account fetch karo — tera createdAt chahiye
  const currentUser = await UserModel.findById(userId)
    .select("createdAt")
    .lean();

  const userJoinDate = new Date(currentUser.createdAt);
  const deadline = new Date(userJoinDate);
  deadline.setDate(deadline.getDate() + 60); // ✅ Tera join date + 60 days

  // Step 3: Tere directs jo tere join ke 60 days ke andar aaye
  const directUsers = await UserModel.find({
    sponserId: userId,
    createdAt: { $lte: deadline }, // ✅ Direct tera join+60days se pehle aaya ho
  })
    .select("_id")
    .lean();

  if (directUsers.length < 2) {
    return {
      allowed: false,
      message: `You need at least 2 directs who joined within 60 days of your joining. You have ${directUsers.length} such direct(s).`,
    };
  }

  // Step 4: Un directs ka active investment check
  const directUserIds = directUsers.map((u) => u._id);

  const activeDirectCount = await Investment.distinct("userId", {
    userId: { $in: directUserIds },
    status: "active",
    remainingDays: { $gt: 0 },
  });

  if (activeDirectCount.length >= 2) {
    return { allowed: true };
  }

  return {
    allowed: false,
    message: `You need at least 2 active directs who joined within 60 days of your joining. You have ${activeDirectCount.length} qualifying direct(s).`,
  };
};
