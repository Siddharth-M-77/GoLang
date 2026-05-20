// import cron from "node-cron";
// import { distributeDailyROI } from "./distributeDailyROI.js";
// import { runDailyLevelDistribution } from "./runDailyLevelDistribution.js";
// import { processAllRewards } from "./checkAndProcessRewards.js";

// cron.schedule(
//   "10 0 * * *",
//   async () => {
//     console.log("⏰ Daily ROI Cron Triggered");
//     try {
//       await distributeDailyROI();
//       console.log("✅ Daily ROI completed");
//     } catch (err) {
//       console.error("❌ Daily ROI error:", err);
//     }
//   },
//   { timezone: "Asia/Kolkata" },
// );

// cron.schedule(
//   "30 0 * * *",
//   async () => {
//     console.log("⏰ Daily Level Distribution Triggered");
//     try {
//       await runDailyLevelDistribution();
//       console.log("✅ Level Distribution completed");
//     } catch (err) {
//       console.error("❌ Level Distribution error:", err);
//     }
//   },
//   { timezone: "Asia/Kolkata" },
// );

// cron.schedule(
//   "0 1 * * *",
//   async () => {
//     console.log("⏰ Daily Rank Reward Triggered");
//     try {
//       await processAllRewards();
//       console.log("✅ Rank Reward completed");
//     } catch (err) {
//       console.error("❌ Rank Reward error:", err);
//     }
//   },
//   { timezone: "Asia/Kolkata" },
// );

// cron.schedule("59 23 28-31 * *", async () => {
//   const now = new Date();
//   const tomorrow = new Date(now);
//   tomorrow.setDate(now.getDate() + 1);

//   if (tomorrow.getMonth() !== now.getMonth()) {
//     console.log(`[RESET CRON] 🚀 Started — ${now.toISOString()}`);

//     try {
//       const result = await UserModel.updateMany(
//         {},
//         {
//           $set: {
//             currentMonthBusiness: 0,
//             currentMonthTotalInvestment: 0,
//           },
//         },
//       );

//       console.log(`[RESET CRON] ✅ Done — ${result.modifiedCount} users reset`);
//     } catch (err) {
//       console.error(`[RESET CRON] ❌ Error:`, err.message);
//     }
//   }
// });
