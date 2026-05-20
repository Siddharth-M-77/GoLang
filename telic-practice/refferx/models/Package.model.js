import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  name: String,
  price: Number,
  dailyROI: Number,
  description: String,
  durationDays: Number,
  minWithdrawal: Number,
  deductionPercent: Number,
  dailyROIStart: Number,
  dailyROIMax: Number,
  maxReturnMultiplier: Number,
});

const Package = mongoose.model("Package", packageSchema);

export default Package;
