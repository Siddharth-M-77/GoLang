import mongoose from "mongoose";

const aroiSchema = new mongoose.Schema(
  {
    // =========================================
    // USER
    // =========================================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },

    // =========================================
    // INVESTMENT
    // =========================================
    investmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investment",
      required: true,
    },

    // =========================================
    // PLAN DETAILS
    // =========================================
    planName: {
      type: String,
      default: "",
    },

    investmentAmount: {
      type: Number,
      required: true,
    },

    // =========================================
    // ROI DETAILS
    // =========================================
    roiAmount: {
      type: Number,
      required: true,
    },

    percentage: {
      type: Number,
      default: 0,
    },

    totalReceivedAmount: {
      type: Number,
      default: 0,
    },

    totalReturnPercentage: {
      type: Number,
      default: 135,
    },

    dayNumber: {
      type: Number,
      default: 1,
    },

    totalDays: {
      type: Number,
      default: 30,
    },

    // =========================================
    // SPONSOR COMMISSION
    // =========================================
    sponsorCommission: {
      type: Number,
      default: 0,
    },

    sponsorPercentage: {
      type: Number,
      default: 10,
    },

    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },

    // =========================================
    // STATUS
    // =========================================
    status: {
      type: String,
      enum: ["pending", "credited", "completed"],
      default: "credited",
    },

    isClaimed: {
      type: Boolean,
      default: false,
    },

    // =========================================
    // DATE
    // =========================================
    creditedOn: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // =========================================
    // TRANSACTION INFO
    // =========================================
    transactionType: {
      type: String,
      default: "Daily ROI",
    },

    remarks: {
      type: String,
      default: "Daily ROI credited successfully.",
    },
  },
  {
    timestamps: true,
  },
);

// =========================================
// INDEXES
// =========================================

// FAST USER SEARCH
aroiSchema.index({ userId: 1 });

// FAST INVESTMENT SEARCH
aroiSchema.index({ investmentId: 1 });

// ONE ROI PER DAY PER INVESTMENT
aroiSchema.index({
  investmentId: 1,
  creditedOn: 1,
});

// =========================================
// MODEL
// =========================================
const Aroi = mongoose.model("Aroi", aroiSchema);

export default Aroi;
