import mongoose from "mongoose";

const odmSchema = new mongoose.Schema(
  {
    price: {
      type: Number,
    },
    usdtPrice: {
      type: Number,
    },
  },
  { timestamps: true },
);

const ODM = mongoose.model("ODM", odmSchema);

export default ODM;
