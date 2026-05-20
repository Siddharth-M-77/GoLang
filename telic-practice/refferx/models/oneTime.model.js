import mongoose from "mongoose";

const oneTimeRewardsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    totalBusiness: {
      type: Number,
      required: true,
    },

    rank: {
      type: String,
      required: true,
    },

    percentage: {
      type: Number,
      default: 2,
    },

    amount: {
      type: Number,
      required: true,
    },

    creditedOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

oneTimeRewardsSchema.index({ userId: 1, rank: 1 }, { unique: true });

const OneTimeReward = mongoose.model("OneTimeReward", oneTimeRewardsSchema);

export default OneTimeReward;
