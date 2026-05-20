import axios from "axios";
import ODM from "./odm.model.js";
export const getUSDTPriceInINR = async () => {
  try {
    const usdtPrice = await ODM.findOne().sort({ createdAt: -1 }).lean();
    if (usdtPrice && usdtPrice.usdtPrice) {
      return usdtPrice.usdtPrice;
    } else {
      throw new Error("No USDT price found");
    }
  } catch (error) {
    console.error("Error fetching USDT price:", error.message);
    return 90;
  }
};

export const getODMPrice = async () => {
  try {
    const price = await ODM.findOne().sort({ createdAt: -1 }).lean();
    if (price && price.price) {
      return price.price;
    } else {
      throw new Error("No ODM price found");
    }
  } catch (error) {
    console.error("Error fetching ODM price:", error.message);
    return 1;
  }
};
