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
      default: 0,
    },
    lifeTimeReward: {
      type: String,
    },
    business: {
      type: Number,
      default: 0,
    },
    isFast: {
      type: Boolean,
      default: false,
    },
    usdtPrice: {
      type: Number,
      default: 0,
    },

    odmRate: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const MatchingReward = mongoose.model("MatchingReward", matchingRewardSchema);

export default MatchingReward;
