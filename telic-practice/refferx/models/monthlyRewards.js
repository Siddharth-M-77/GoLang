import mongoose from "mongoose";

const monthlyRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    usdtAmount: {
      type: Number,
      default: 0,
    },
    odmAmount: {
      type: Number,
      default: 0,
    },
    creditedOn: {
      type: Date,
      default: Date.now,
    },
    rewardTier: {
      type: String,
    },
    monthCount: {
      type: Number,
      default: 0,
    },
    totalBusiness: {
      type: Number,
      default: 0,
    },
    usdtPrice: {
      type: Number,
      default: 0,
    },
    odmRate: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const MonthlyRewards = mongoose.model("MonthlyRewards", monthlyRewardSchema);
export default MonthlyRewards;
