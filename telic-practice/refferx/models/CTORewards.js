import mongoose from "mongoose";

const matchingRewardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },
    rank: {
      type: String,
      default: "",
    },
    creditedOn: {
      type: Date,
      default: Date.now,
    },
    percent: {
      type: Number,
      default: 0,
    },
    odmRate: {
      type: Number,
      default: 0,
    },
    usdtPrice: {
      type: Number,
      default: 0,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    totalBusinessInr: {
      type: Number,
      default: 0,
    },

    rank: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const CTORewards = mongoose.model("CTORewards", matchingRewardSchema);

export default CTORewards;
