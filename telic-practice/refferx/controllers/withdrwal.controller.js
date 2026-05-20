import axios from "axios";
import dotenv from "dotenv";

import UserModel from "../models/user.model.js";
import Withdrawal from "../models/withdrwal.model.js";

dotenv.config();

export const processWithdrawal = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;

    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Pending withdrawal check
    const alreadyWithdrawal = await Withdrawal.findOne({
      userId: user._id,
      status: "pending",
    });

    if (alreadyWithdrawal) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending withdrawal.",
      });
    }

    // Balance check
    if (user.currentEarnings < withdrawAmount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    // Fee
    const fee = withdrawAmount * 0.1;

    // Final amount user gets
    const finalAmount = withdrawAmount - fee;

    // Create withdrawal record
    const withdrawal = await Withdrawal.create({
      userId: user._id,
      userWalletAddress: user.walletAddress,
      amount: withdrawAmount,
      fee,
      finalAmount,
      status: "pending",
    });

    // =========================
    // OXAPAY PAYOUT API
    // =========================

    const payload = {
      key: process.env.OXAPAY_API_KEY,
      currency: "USDT",
      network: "BSC",
      address: user.walletAddress,
      amount: finalAmount,
    };

    const response = await axios.post(
      "https://api.oxapay.com/v1/payout",
      payload,
    );

    console.log(response.data);

    // SUCCESS
    if (response.data.status === "success") {
      withdrawal.status = "completed";
      withdrawal.txHash = response.data.txid;

      await withdrawal.save();

      // Deduct wallet balance
      user.currentEarnings -= withdrawAmount;

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Withdrawal successful",
        txHash: response.data.txid,
      });
    }

    // FAILED
    withdrawal.status = "failed";
    withdrawal.errorMessage = response.data.message || "Withdrawal failed";

    await withdrawal.save();

    return res.status(400).json({
      success: false,
      message: response.data.message,
    });
  } catch (err) {
    console.error("Withdrawal Error:", err);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// export const processWithdrawal = async (req, res) => {
//   const userId = req.user._id;
//   const session = await mongoose.startSession();

//   try {
//     session.startTransaction();

//     const { amount, upiId, upiName, bankName, accountNumber, ifscCode } =
//       req.body;

//     if (!amount || !bankName || !accountNumber || !ifscCode) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: "Amount, UPI ID, and UPI Name are required",
//       });
//     }

//     const numericAmount = Number(amount);

//     const user = await UserModel.findById(userId).session(session);

//     if (!user) {
//       await session.abortTransaction();
//       return res.status(404).json({ success: false });
//     }

//     if (user.isWithdrawalBlocked) {
//       await session.abortTransaction();
//       return res.status(403).json({
//         success: false,
//         message: "Withdrawal blocked",
//       });
//     }

//     const directCheck = await canUserWithdraw(userId);

//     if (!directCheck.allowed) {
//       await session.abortTransaction();
//       return res.status(403).json({
//         success: false,
//         message: directCheck.message,
//       });
//     }

//     if (user.currentEarnings < numericAmount) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: "Insufficient balance",
//       });
//     }

//     // 🔒 Check pending inside transaction
//     const pendingExists = await Withdrawal.findOne({
//       userId,
//       status: "pending",
//     }).session(session);

//     if (pendingExists) {
//       await session.abortTransaction();
//       return res.status(400).json({
//         success: false,
//         message: "Already pending request",
//       });
//     }

//     // 💰 Deduct balance
//     user.currentEarnings -= numericAmount;
//     await user.save({ session });

//     // 📝 Create withdrawal
//     await Withdrawal.create(
//       [
//         {
//           userId,
//           amount: numericAmount,
//           upiId: upiId || "",
//           currency: "INR",
//           status: "pending",
//           upiName: upiName || "",
//           bankName,
//           accountNumber,
//           ifscCode,
//         },
//       ],
//       { session },
//     );

//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       success: true,
//       message: "Withdrawal request submitted",
//     });
//   } catch (err) {
//     await session.abortTransaction();
//     session.endSession();

//     console.error("Withdrawal Error:", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
export const approveWithdrawal = async (req, res) => {
  const { id } = req.body;
  const adminId = req.user?._id;

  try {
    const withdrawal = await Withdrawal.findById(id);
    const user = await UserModel.findById(withdrawal.userId);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawals can be approved",
      });
    }

    // if (req.file) {
    //   const upload = await uploadToCloudinary(req.file, "withdrawals");
    //   withdrawal.proofImage = {
    //     url: upload.secure_url,
    //     publicId: upload.public_id,
    //   };
    // }
    withdrawal.status = "approved";
    withdrawal.approvedDate = new Date();
    withdrawal.processedBy = adminId;
    user.totalPayouts += withdrawal.amount;
    await user.save();
    await withdrawal.save();
    return res.status(200).json({
      success: true,
      message: "Withdrawal approved (payment pending)",
    });
  } catch (error) {
    console.error("Approve Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const rejectWithdrawal = async (req, res) => {
  const { id, reason } = req.body;
  const adminId = req.user?._id;

  try {
    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal not found",
      });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending withdrawals can be rejected",
      });
    }

    const user = await UserModel.findById(withdrawal.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.currentEarnings += withdrawal.amount;

    await user.save();

    withdrawal.status = "rejected";
    withdrawal.rejectionReason = reason || "Rejected by admin";
    withdrawal.processedBy = adminId;
    withdrawal.approvedDate = new Date();

    await withdrawal.save();

    return res.status(200).json({
      success: true,
      message: "Withdrawal rejected & amount refunded",
    });
  } catch (error) {
    console.error("Reject Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
