import mongoose from "mongoose";
import dotenv from "dotenv";
import Level from "../models/level.model.js";
dotenv.config();
const seedLevels = async () => {
  try {
    // ✅ MongoDB connect
    await mongoose.connect("");
    console.log("✅ MongoDB Connected");

    await Level.deleteMany();
    console.log("🗑️ Old levels removed");

    // ✅ 10 Level Data
    const levelsData = [
      { level: 1, percent: 20 },
      { level: 2, percent: 10 },
      { level: 3, percent: 5 },
      { level: 4, percent: 4 },
      { level: 5, percent: 3 },
      { level: 6, percent: 2 },
      { level: 7, percent: 1 },
      { level: 8, percent: 1 },
      { level: 9, percent: 1 },
      { level: 10, percent: 1 },
      { level: 11, percent: 1 },
      { level: 12, percent: 1 },
      { level: 13, percent: 1 },
      { level: 14, percent: 1 },
      { level: 15, percent: 1 },
      { level: 16, percent: 0.5 },
      { level: 17, percent: 0.5 },
      { level: 18, percent: 0.5 },
      { level: 19, percent: 0.5 },
      { level: 20, percent: 0.5 },
      { level: 21, percent: 0.5 },
      { level: 22, percent: 0.5 },
      { level: 23, percent: 0.5 },
      { level: 24, percent: 0.5 },
      { level: 25, percent: 0.5 },
    ];

    await Level.insertMany(levelsData);

    console.log("🚀 20 Levels Seeded Successfully");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};
seedLevels();
