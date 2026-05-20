import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    // =========================================
    // USER
    // =========================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },

    // =========================================
    // INVESTMENT DETAILS
    // =========================================
    investmentAmount: {
      type: Number,
      required: true,
    },

    usdtAmount: {
      type: Number,
      default: 0,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },

    planName: {
      type: String,
      default: "",
    },

    txHash: {
      type: String,
      default: "",
    },

    // =========================================
    // ROI SETTINGS
    // =========================================
    totalReturnPercentage: {
      type: Number,
      default: 135,
    },

    dailyPercentage: {
      type: Number,
      default: 4.5,
    },

    totalDays: {
      type: Number,
      default: 30,
    },

    remainingDays: {
      type: Number,
      default: 30,
      index: true,
    },

    dailyBaseAmount: {
      type: Number,
      required: true,
    },

    totalExpectedReturn: {
      type: Number,
      default: 0,
    },

    totalRoiEarned: {
      type: Number,
      default: 0,
    },

    totalReceivedAmount: {
      type: Number,
      default: 0,
    },

    // =========================================
    // DISTRIBUTION
    // =========================================
    nextDistributionDate: {
      type: Date,
      index: true,
      default: Date.now,
    },

    lastDistributedAt: {
      type: Date,
      default: null,
    },

    // =========================================
    // SPONSOR / UPLINE
    // =========================================
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },

    sponsorCommissionPercentage: {
      type: Number,
      default: 10,
    },

    totalSponsorCommissionPaid: {
      type: Number,
      default: 0,
    },

    // =========================================
    // UPLINE CHAIN
    // =========================================
    uplineChain: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
        },

        level: {
          type: Number,
          default: 1,
        },
      },
    ],

    // =========================================
    // STATUS
    // =========================================
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },

    roiStatus: {
      type: String,
      enum: ["running", "completed"],
      default: "running",
    },

    // =========================================
    // ADDED INFO
    // =========================================
    addedBy: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },

    investmentDate: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // =========================================
    // META
    // =========================================
    remarks: {
      type: String,
      default: "Investment activated successfully.",
    },
  },
  {
    timestamps: true,
  },
);

// =========================================
// AUTO CALCULATE TOTAL RETURN
// =========================================
investmentSchema.pre("save", function (next) {
  this.totalExpectedReturn =
    (this.investmentAmount * this.totalReturnPercentage) / 100;

  next();
});

// =========================================
// INDEXES
// =========================================

// FAST ROI CRON
investmentSchema.index({
  status: 1,
  nextDistributionDate: 1,
  remainingDays: 1,
});

// FAST USER ACTIVE PLAN
investmentSchema.index({
  userId: 1,
  status: 1,
});

// =========================================
// MODEL
// =========================================
const Investment = mongoose.model("Investment", investmentSchema);

export default Investment;
