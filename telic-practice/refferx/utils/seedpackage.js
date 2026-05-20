import mongoose from "mongoose";
import Package from "../models/Package.model.js";

const MONGO_URI = "";
async function connectDB() {
  try {
    await mongoose.connect(
      "mongodb+srv://bhaisiddharth63:9696607477@cluster0.um4bii2.mongodb.net/ORDIMAX",
    );
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
}

async function seedPackages() {
  try {
    const packages = [
      {
        name: "Staking Lock",
        price: 10,
        dailyROI: 0.2,
        durationDays: 1000,
        minWithdrawal: 10,
        deductionPercent: 10,
        reward: "you will get gold or silver as reward",
        description:
          "0.1% daily ROI for 1000 days, minimum deposit & withdrawal $10, 10% deduction",
      },
      {
        name: "Staking Unlock",
        price: 10,
        dailyROI: 0.2,
        durationDays: 1000,
        minWithdrawal: 10,
        deductionPercent: 10,
        description:
          "0.2% daily ROI for 1000 days, minimum deposit & withdrawal $10, 10% deduction",
      },
      {
        name: "Staking Compound",
        price: 10,
        dailyROIStart: 0.2,
        dailyROIMax: 1,
        maxReturnMultiplier: 2,
        minWithdrawal: 10,
        deductionPercent: 10,
        description:
          "Starts 0.2% daily ROI, compounds up to 1% daily ROI, max 2x return",
      },
    ];
    await Package.deleteMany({});
    await Package.insertMany(packages);

    console.log("✅ Packages Seeded Successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding Error:", err);
    process.exit(1);
  }
}

// 🚀 Run
async function run() {
  await connectDB();
  await seedPackages();
}

run();
