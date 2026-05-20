import mongoose from "mongoose";

const swapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    usdt: {
      type: Number,
      required: true,
    },
    odmAmount: {
      type: Number,
      required: true,
    },
    feeOdm: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
    },
  },
  {
    timestamps: true,
  },
);

const Swap = mongoose.model("Swap", swapSchema);
export default Swap;
