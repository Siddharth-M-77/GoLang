import mongoose from "mongoose";
const depositSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
    },
    payAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
    payCurrency: {
      type: String,
      default: "USDT",
    },
    network: {
      type: String,
      default: "BSC",
    },

    // OxaPay response data
    trackId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    address: {
      type: String, // deposit wallet address (har baar unique OxaPay deta hai)
      default: "",
    },
    qrCodeUrl: {
      type: String, // QR code image URL from OxaPay
      default: "",
    },
    payLink: {
      type: String,
      default: "",
    },
    expiredAt: {
      type: Date,
    },

    // Payment confirmation
    txHash: {
      type: String,
      default: "",
    },
    confirmations: {
      type: Number,
      default: 0,
    },
    senderAddress: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["New", "Waiting", "Confirming", "Paid", "Expired", "Failed"],
      default: "New",
    },

    webhookData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto
  },
);

const Deposit = mongoose.model("Deposit", depositSchema);
export default Deposit;
