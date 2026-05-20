import mongoose from "mongoose";

const proofImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    public_id: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const depositINRSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
      index: true,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["UPI", "IMPS", "CRYPTO", "adminTopup"],
      // uppercase: true,
      index: true,
    },

    amount_inr: {
      type: Number,
      default: 0,
      min: 0,
    },

    proofImage: {
      type: proofImageSchema,
      required: false,
      default: null,
    },

    // ✅ Status
    status: {
      type: String,
      enum: ["pending", "success", "failed", "rejected", "approved"],
      default: "pending",
      index: true,
    },

    response: {
      type: String,
      default: "",
      trim: true,
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    addedBy: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

depositINRSchema.index(
  { utr: 1 },
  { unique: true, partialFilterExpression: { utr: { $type: "string" } } },
);

const DepositINR = mongoose.model("DepositINR", depositINRSchema);
export default DepositINR;
