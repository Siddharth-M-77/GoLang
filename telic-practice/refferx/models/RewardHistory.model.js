import mongoose from "mongoose";

const rewardHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    rewardLevel: {
      type: Number,
      required: true,
    },
    rewardLevelName: {
      type: String,
      required: true,
    },
    rewardAmount: {
      type: Number,
      required: true,
    },
    selfInvestment: {
      type: Number,
      default: 0,
    },
    legDetails: [
      {
        legUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },
        name: String,
        volume: Number,
        target: Number,
      },
    ],
    carryForwardBefore: {
      type: Number,
      default: 0,
    },
    carryForwardAfter: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["credited", "pending", "failed"],
      default: "credited",
    },
  },
  { timestamps: true },
);

const RewardHistoryModel = mongoose.model("RewardHistory", rewardHistorySchema);
export default RewardHistoryModel;
