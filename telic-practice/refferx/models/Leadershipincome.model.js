import mongoose from "mongoose";

const leadershipIncomeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    percent: {
      type: Number,
      default: 0,
    },
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    roiAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

const LeadershipIncome =
  mongoose.models.LeadershipIncome ||
  mongoose.model("LeadershipIncome", leadershipIncomeSchema);

export default LeadershipIncome;
