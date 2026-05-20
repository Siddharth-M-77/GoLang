import Admin from "../models/admin.model.js";
import Investment from "../models/investment.model.js";
import LevelIncome from "../models/LevelIncome.model.js";
import ReferalBonus from "../models/referalbonus.model.js";
import Aroi from "../models/roi.model.js";
import Support from "../models/support.model.js";
import UserModel from "../models/user.model.js";
import Withdrawal from "../models/withdrwal.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path, { dirname } from "path";
import fs from "fs";
import Banner from "../models/banner.model.js";
import { fileURLToPath } from "url";
import Settings from "../models/settings.model.js";
import MonthlyRewards from "../models/monthlyRewards.js";
import OneTimeReward from "../models/oneTime.model.js";
import { generateRandomTxResponse } from "../utils/Random.js";
import { AdminTopUp } from "../models/adminTopUp.model.js";
import Level from "../models/level.model.js";
import Package from "../models/Package.model.js";
import { distributeLevelIncomeOnRoi } from "../utils/levelIncome.js";
import MatchingReward from "../models/matchingreward.model.js";
import CTORewards from "../models/CTORewards.js";
import LeadershipIncome from "../models/Leadershipincome.model.js";
import { getODMPrice, getUSDTPriceInINR } from "../utils/cryptoUtils.js";
import ODM from "../utils/odm.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import DepositINR from "../models/DepositINR.model.js";
import mongoose from "mongoose";

export const adminRegister = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All Feild are requireds",
        success: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      email,
      password: hashPassword,
    });
    if (!newAdmin) {
      return res.status(400).json({
        message: "User Not Created",
        success: false,
      });
    }
    const admin = await newAdmin.save();

    return res.status(200).json({
      message: "Register Successfull",
      success: true,
      data: admin,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    const user = await Admin.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: "User not found",
        success: false,
      });
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      return res.status(404).json({
        message: "Invalid credentials",
        success: false,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie and send response
    return res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Secure in production
        sameSite: "none",
      })
      .status(200)
      .json({
        success: true,
        token,
        data: {
          _id: user._id,
          email: user.email,
          walletAddress: user.walletAddress,
          role: user.role,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message || "Server error",
      success: false,
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.admin;
    if (!userId) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const user = await Admin.findById(userId);
    if (!user) {
      return res.status(200).json({
        message: "User not found",
      });
    }
    return res.status(200).json({
      message: "User Profile",
      data: user,
      success: true,
    });
  } catch (error) {}
};
export const getDailyRoi = async (req, res) => {
  try {
    const userId = req.admin;
    if (!userId) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const dailyRoi = await Aroi.find({})
      .populate("userId investmentId")
      .sort({ date: -1 });
    return res.status(200).json({
      message: "All User DailyRoi History",
      data: dailyRoi,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const allUsers = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const users = await UserModel.find()
      .select(
        "name email totalInvestment totalEarnings currentEarnings referralCode isVerified createdAt totalBusiness ",
      )
      .lean()
      .sort({ createdAt: -1 });
    if (!users || users.length === 0) {
      return res.status(200).json({
        message: "No users found",
        data: [],
        success: true,
      });
    }

    return res.status(200).json({
      message: "All Users",
      data: users,
      success: true,
    });
  } catch (error) {
    console.error("Error in allUsers:", error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await UserModel.find({})
      .sort({ createdAt: -1 })
      .lean()
      .exct();
    if (!users) {
      return res.status(200).json({
        message: "no users",
        data: [],
      });
    }

    return res.status(200).json({
      message: "All Users",
      data: users,
    });
  } catch (error) {}
};
export const getAllLevelIncome = async (req, res) => {
  try {
    const userId = req.admin;
    if (!userId) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const levelIncome = await LevelIncome.find({}).populate(
      "userId fromUserId",
      "username walletAddress name",
    );
    return res.status(200).json({
      message: "All User Level Income History",
      data: levelIncome,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

export const getAllReferalBonus = async (req, res) => {
  try {
    const userId = req.admin || req.user;
    if (!userId) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const referalBonus = await ReferalBonus.find({})
      .lean()
      .populate({
        path: "userId fromUser",
        select: "username walletAddress name",
      })
      .populate("investmentId", "investmentAmount status")
      .sort({ createdAt: -1 });
    if (!referalBonus) {
      return res.status(200).json({
        message: "No referal bonus found",
      });
    }
    return res.status(200).json({
      message: "All User Referal Bonus History",
      data: referalBonus,
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
      success: false,
    });
  }
};

// export const getAllIncomes = async (req, res) => {
//   try {
//     const admin = req.admin;
//     if (!admin) {
//       return res.status(401).json({
//         message: "Unauthorized",
//         success: false,
//       });
//     }

//     const todayStart = new Date();
//     todayStart.setHours(0, 0, 0, 0);
//     const todayEnd = new Date();
//     todayEnd.setHours(23, 59, 59, 999);

//     const totalUsers = await UserModel.countDocuments();

//     // --- Investments ---
//     const totalInvestmentResult = await DepositINR.aggregate([
//       { $group: { _id: null, totalInvestment: { $sum: "$amount_inr" } } },
//     ]);
//     const totalInvestment = totalInvestmentResult[0]?.totalInvestment || 0;

//     const todayInvestmentResult = await DepositINR.aggregate([
//       { $match: { investmentDate: { $gte: todayStart, $lte: todayEnd } } },
//       { $group: { _id: null, todayInvestment: { $sum: "$amount_inr" } } },
//     ]);
//     const todayInvestment = todayInvestmentResult[0]?.todayInvestment || 0;

//     // --- ROI ---
//     const totalRoiResult = await Aroi.aggregate([
//       { $group: { _id: null, totalRoi: { $sum: "$roiAmount" } } },
//     ]);
//     const totalRoi = totalRoiResult[0]?.totalRoi || 0;

//     const todayRoiResult = await Aroi.aggregate([
//       { $match: { creditedOn: { $gte: todayStart, $lte: todayEnd } } },
//       { $group: { _id: null, todayRoi: { $sum: "$roiAmount" } } },
//     ]);
//     const todayRoi = todayRoiResult[0]?.todayRoi || 0;

//     // --- Level Income ---
//     const totalLevelIncomeResult = await LevelIncome.aggregate([
//       { $group: { _id: null, totalLevelIncome: { $sum: "$amount" } } },
//     ]);
//     const totalLevelIncome = totalLevelIncomeResult[0]?.totalLevelIncome || 0;

//     const todayLevelIncomeResult = await LevelIncome.aggregate([
//       { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
//       { $group: { _id: null, todayLevelIncome: { $sum: "$amount" } } },
//     ]);
//     const todayLevelIncome = todayLevelIncomeResult[0]?.todayLevelIncome || 0;

//     const totalMatchingResult = await MatchingReward.aggregate([
//       { $group: { _id: null, totalMatching: { $sum: "$amount" } } },
//     ]);
//     const totalMatchingIncome = totalMatchingResult[0]?.totalMatching || 0;

//     const todayMatchingResult = await MatchingReward.aggregate([
//       { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
//       { $group: { _id: null, todayMatching: { $sum: "$amount" } } },
//     ]);
//     const todayMatchingIncome = todayMatchingResult[0]?.todayMatching || 0;

//     // --- Withdrawals ---
//     const totalWithdrawalResult = await Withdrawal.aggregate([
//       { $group: { _id: null, totalWithdrawal: { $sum: "$amount" } } },
//     ]);
//     const totalWithdrawal = totalWithdrawalResult[0]?.totalWithdrawal || 0;

//     const todayWithdrawalResult = await Withdrawal.aggregate([
//       { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
//       { $group: { _id: null, todayWithdrawal: { $sum: "$amount" } } },
//     ]);
//     const todayWithdrawal = todayWithdrawalResult[0]?.todayWithdrawal || 0;

//     // --- Referral Bonus ---
//     const totalReferralResult = await ReferalBonus.aggregate([
//       { $group: { _id: null, totalReferral: { $sum: "$amount" } } },
//     ]);
//     const totalReferral = totalReferralResult[0]?.totalReferral || 0;

//     const todayReferralResult = await ReferalBonus.aggregate([
//       { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
//       { $group: { _id: null, todayReferral: { $sum: "$amount" } } },
//     ]);
//     const todayReferral = todayReferralResult[0]?.todayReferral || 0;

//     const totalRankReward = await RewardHistoryModel.aggregate({
//       $group: {
//         _id: null,
//         totalRankReward: { $sum: "$rewardAmount" },
//       },
//     });

//     const todayRankReward = await RewardHistoryModel.aggregate({
//       $match: {
//         createdAt: { $gte: todayStart, $lte: todayEnd },
//       },
//       $group: {
//         _id: null,
//         todayRankReward: { $sum: "$rewardAmount" },
//       },
//     });

//     const totalRankReward = totalRankReward[0]?.totalRankReward || 0;
//     const todayRankReward = todayRankReward[0]?.todayRankReward || 0;
//     // --- Response ---
//     return res.status(200).json({
//       message: "Platform Income Summary",
//       success: true,
//       data: {
//         totalUsers,
//         totalInvestment,
//         todayInvestment,
//         totalRoi,
//         todayRoi,
//         totalLevelIncome,
//         todayLevelIncome,
//         totalWithdrawal,
//         todayWithdrawal,
//         totalReferral,
//         todayReferral,
//         totalRankReward,
//         todayRankReward,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getAllIncomes:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Server Error",
//     });
//   }
// };

export const getAllIncomes = async (req, res) => {
  try {
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const totalUsers = await UserModel.countDocuments();

    // --- Investments ---
    const totalInvestmentResult = await DepositINR.aggregate([
      { $group: { _id: null, totalInvestment: { $sum: "$amount_inr" } } },
    ]);
    const totalInvestment = totalInvestmentResult[0]?.totalInvestment || 0;

    const todayInvestmentResult = await DepositINR.aggregate([
      { $match: { investmentDate: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayInvestment: { $sum: "$amount_inr" } } },
    ]);
    const todayInvestment = todayInvestmentResult[0]?.todayInvestment || 0;

    // --- ROI ---
    const totalRoiResult = await Aroi.aggregate([
      { $group: { _id: null, totalRoi: { $sum: "$roiAmount" } } },
    ]);
    const totalRoi = totalRoiResult[0]?.totalRoi || 0;

    const todayRoiResult = await Aroi.aggregate([
      { $match: { creditedOn: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayRoi: { $sum: "$roiAmount" } } },
    ]);
    const todayRoi = todayRoiResult[0]?.todayRoi || 0;

    // --- Level Income ---
    const totalLevelIncomeResult = await LevelIncome.aggregate([
      { $group: { _id: null, totalLevelIncome: { $sum: "$amount" } } },
    ]);
    const totalLevelIncome = totalLevelIncomeResult[0]?.totalLevelIncome || 0;

    const todayLevelIncomeResult = await LevelIncome.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayLevelIncome: { $sum: "$amount" } } },
    ]);
    const todayLevelIncome = todayLevelIncomeResult[0]?.todayLevelIncome || 0;

    // --- Matching Income ---
    const totalMatchingResult = await MatchingReward.aggregate([
      { $group: { _id: null, totalMatching: { $sum: "$amount" } } },
    ]);
    const totalMatchingIncome = totalMatchingResult[0]?.totalMatching || 0;

    const todayMatchingResult = await MatchingReward.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayMatching: { $sum: "$amount" } } },
    ]);
    const todayMatchingIncome = todayMatchingResult[0]?.todayMatching || 0;

    // --- Withdrawals ---
    const totalWithdrawalResult = await Withdrawal.aggregate([
      { $group: { _id: null, totalWithdrawal: { $sum: "$amount" } } },
    ]);
    const totalWithdrawal = totalWithdrawalResult[0]?.totalWithdrawal || 0;

    const todayWithdrawalResult = await Withdrawal.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayWithdrawal: { $sum: "$amount" } } },
    ]);
    const todayWithdrawal = todayWithdrawalResult[0]?.todayWithdrawal || 0;

    // --- Referral Bonus ---
    const totalReferralResult = await ReferalBonus.aggregate([
      { $group: { _id: null, totalReferral: { $sum: "$amount" } } },
    ]);
    const totalReferral = totalReferralResult[0]?.totalReferral || 0;

    const todayReferralResult = await ReferalBonus.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayReferral: { $sum: "$amount" } } },
    ]);
    const todayReferral = todayReferralResult[0]?.todayReferral || 0;

    // --- Rank Reward ---
    const totalRankRewardResult = await RewardHistoryModel.aggregate([
      { $group: { _id: null, totalRankReward: { $sum: "$rewardAmount" } } },
    ]);
    const totalRankReward = totalRankRewardResult[0]?.totalRankReward || 0;

    const todayRankRewardResult = await RewardHistoryModel.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lte: todayEnd } } },
      { $group: { _id: null, todayRankReward: { $sum: "$rewardAmount" } } },
    ]);
    const todayRankReward = todayRankRewardResult[0]?.todayRankReward || 0;

    // --- Response ---
    return res.status(200).json({
      message: "Platform Income Summary",
      success: true,
      data: {
        totalUsers,
        totalInvestment,
        todayInvestment,
        totalRoi,
        todayRoi,
        totalLevelIncome,
        todayLevelIncome,
        totalMatchingIncome,
        todayMatchingIncome,
        totalWithdrawal,
        todayWithdrawal,
        totalReferral,
        todayReferral,
        totalRankReward,
        todayRankReward,
      },
    });
  } catch (error) {
    console.error("Error in getAllIncomes:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getTotalInvestedUsers = async (_, res) => {
  try {
    const allInvestUsers = await Investment.find({})
      .populate("userId", "username walletAddress")
      .lean()
      .exec();
    if (!allInvestUsers) {
      return res.status(200).json({
        message: "No Invested Users",
        success: false,
      });
    }

    return res.status(200).json({
      message: "All Invested Users",
      success: false,
      data: allInvestUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "server error",
      success: false,
    });
  }
};

export const getLevelIncomeHistory = async (_, res) => {
  try {
    const getAllLevelIncomes = await LevelIncome.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "userId fromUserId",
        select: "username walletAddress levelIncome name",
      })
      .lean();
    if (!getAllLevelIncomes) {
      return res.status(404).json({
        message: "No Level Income History Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "LevelIncome History",
      success: true,
      data: getAllLevelIncomes,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Errro",
    });
  }
};

export const getAllMessage = async (req, res) => {
  try {
    const allTickets = await Support.find({}).sort({ createdAt: -1 });
    if (!allTickets) {
      return res.sta(200).json({
        messae: "No Tickets Founds",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Tickets Fetched",
      success: false,
      data: allTickets,
    });
  } catch (error) {}
};

export const ticketApprove = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!ticketId || !message) {
      return res.status(400).json({
        message: "Ticket Id && message are required",
        success: false,
      });
    }

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }

    ticket.status = "Approved";
    ticket.response = message;
    await ticket.save();

    return res.status(200).json({
      message: "Ticket Approved Successfully",
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};

export const ticketReject = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;

    if (!ticketId || !message) {
      return res.status(400).json({
        message: "Ticket Id  & message are required",
        success: false,
      });
    }

    const ticket = await Support.findById(ticketId);

    if (!ticket) {
      return res.status(404).json({
        message: "Ticket not found",
        success: false,
      });
    }

    ticket.status = "Rejected";
    ticket.response = message;
    await ticket.save();

    return res.status(200).json({
      message: "Ticket Rejected Successfully",
      success: true,
      data: ticket,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};

export const getRoiHistory = async (req, res) => {
  try {
    const roiHistories = await Aroi.find({})
      .populate({
        path: "userId",
        select: "username walletAddress",
      })
      .populate("investmentId", "totalRoiEarned")
      .lean();
    if (!roiHistories) {
      return res.status(200).json({
        message: "Roi history not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "ROI History Fetched",
      success: false,
      data: roiHistories,
    });
  } catch (error) {}
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let currentBanner = null;
// export const uploadBanner = async (req, res) => {
//   try {
//     const { title , description } = req.body;
//     if (!title) {
//       return res.status(400).json({
//         message: "title is required",
//         success: false,
//       });
//     }
//     if (!req.file) {
//       return res.status(400).json({ message: "No banner uploaded" });
//     }

//     const newBanner = new Banner({
//       imageUrl: `/uploads/banners/${req.file.filename}`,
//       title: title,
//       description
//     });

//     await newBanner.save();

//     res.status(201).json({
//       message: "Banner uploaded successfully",
//       banner: newBanner,
//       description
//     });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Banner upload failed", error: error.message });
//   }
// };

export const uploadBanner = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Banner image is required",
      });
    }

    const imageUrl = req.file.path;
    const public_id = req.file.filename;

    const banner = await Banner.create({
      title: title.trim(),
      description: description?.trim(),
      imageUrl,
      public_id,
    });

    return res.status(201).json({
      success: true,
      message: "Banner uploaded successfully",
      banner,
    });
  } catch (error) {
    console.error("Upload error:", error);

    // 🔥 rollback (CRITICAL in prod)
    if (req.file?.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }

    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};
export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "Banners fetched successfully",
      success: true,
      data: banners,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch banners",
      success: false,
      error: error.message,
    });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const imagePath = path.join(__dirname, ".. ", banner.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Banner.findByIdAndDelete(req.params.id);

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete banner", error: error.message });
  }
};

export const updateGlobalLimit = async (req, res) => {
  const { newLimit } = req.body;

  if (!newLimit || isNaN(newLimit)) {
    return res.status(400).json({ message: "Invalid limit" });
  }

  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({ withdrawalLimit: newLimit });
    } else {
      settings.withdrawalLimit = newLimit;
      await settings.save();
    }

    res.json({ message: "Global withdrawal limit updated", success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update", error: err.message });
  }
};

export const allWithdrawals = async (req, res) => {
  try {
    const userId = req.admin._id;
    if (!userId) {
      return res.status(400).json({
        messae: "Please Login First",
        success: false,
      });
    }

    const allWithdrawals = await Withdrawal.find({})
      .populate("userId", "username email")
      .lean();
    if (!allWithdrawals || allWithdrawals.length === 0) {
      return res.status(200).json({
        message: "No Withdrawals Found",
        success: false,
      });
    }
    return res.status(200).json({
      message: "All Withdrawals fetched",
      success: true,
      data: allWithdrawals,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.messae || "Server Error",
      success: false,
    });
  }
};

export const monthlyIncomeHistory = async (req, res) => {
  try {
    const userId = req.admin._id;

    if (!userId) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const monthlyHistory = await MonthlyRewards.find({}).populate({
      path: "userId",
      select: "username",
    });
    if (!monthlyHistory || monthlyHistory.length === 0) {
      return res.status(200).json({
        message: "No History Found",
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      message: "History fetched Successfully",
      success: true,
      data: monthlyHistory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Monthly History Error",
      success: false,
    });
  }
};

export const getOneTimeTeamRewardsHistory = async (req, res) => {
  try {
    const userId = req.admin._id;
    if (!userId) {
      return res.status(404).json({
        message: "user not found",
        success: false,
      });
    }

    const oneTimeHistory = await OneTimeReward.find({}).populate({
      path: "userId",
      select: "username",
    });

    if (!oneTimeHistory || oneTimeHistory.length === 0) {
      return res.status(200).json({
        message: "No History Found",
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      message: "History Fetched Successfully",
      success: true,
      data: oneTimeHistory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "One Time Rewards Error",
      success: false,
    });
  }
};

export const adminManualAddMoney = async (req, res) => {
  try {
    const { username, amount } = req.body;
    if (!username || !amount) {
      return res.status(400).json({
        message: "Username or amount is required",
        success: false,
      });
    }

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be a positive number",
        success: false,
      });
    }

    const txhash = await generateRandomTxResponse();

    const investment = await Investment.create({
      userId: user._id,
      investmentAmount: amount,
      investmentDate: Date.now(),
      txResponse: txhash,
      type: "topup By Admin",
    });

    user.investments.push(investment._id);
    user.totalInvestment += Number(amount);
    user.isVerified = true;
    user.status = true;
    user.activeDate = new Date();
    await user.save();

    await AdminTopUp.create({
      userId: user._id,
      amount,
      creditedOn: Date.now(),
    });

    if (user.sponserId) {
      const parentUser = await UserModel.findById(user.sponserId);

      if (parentUser) {
        const referralBonus = amount * 0.05;

        parentUser.directReferalAmount += referralBonus;
        parentUser.totalEarnings += referralBonus;
        parentUser.currentEarnings += referralBonus;
        await parentUser.save();

        await ReferalBonus.create({
          userId: parentUser._id,
          fromUser: user._id,
          amount: referralBonus,
          investmentId: investment._id,
          percent: 5,
          date: new Date(),
        });
      }
    }

    return res.status(200).json({
      message: "User TopUp successfully",
      success: true,
      investment,
    });
  } catch (error) {
    console.error("Error in AdminTopUp:", error);
    return res.status(500).json({
      message: error.message || "Server error",
      success: false,
    });
  }
};

export const toggleWithdrawalAccess = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { canWithdraw: !user.canWithdraw } },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: `Withdrawal ${
        updatedUser.canWithdraw ? "unblocked" : "blocked"
      } successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in toggleWithdrawalAccess:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const toggleUserLogin = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await UserModel.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: userId },
      { $set: { isLoginBlocked: !user.isLoginBlocked } },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: `User login ${
        updatedUser.isLoginBlocked ? "blocked" : "unblocked"
      } successfully`,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error in toggleUserLogin:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getLevelConfiguration = async (req, res) => {
  try {
    const config = await Level.find();
    res.status(200).json({
      success: true,
      message: "Level configuration fetched successfully",
      data: config,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().lean().exec();
    res.status(200).json({
      success: true,
      message: "Packages fetched successfully",
      data: packages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updatePackages = async (req, res) => {
  try {
    const { packageId, name, price, dailyROI, maxPrice } = req.body;
    const admin = req.admin;

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!packageId || !name || !price || !dailyROI) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const updatedPackage = await Package.findOneAndUpdate(
      { _id: packageId },
      { $set: { name, price, dailyROI, maxPrice } },
      { new: true },
    );

    if (!updatedPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Package updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateLevelConfig = async (req, res) => {
  try {
    const { level, percent } = req.body;
    if (!level || !percent) {
      return res.status(404).json({
        messae: "All Feilds are required",
        success: false,
      });
    }
    const updateLevel = await Level.findOneAndUpdate(
      { level },
      {
        $set: { level, percent },
      },
      { new: true },
    );
    if (!updateLevel) {
      return res.status(400).json({
        message: " Error in Updating Level",
        success: false,
      });
    }

    return res.status(200).json({
      messae: "Level Updated Successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      messae: "Error in Updating Level",
      success: false,
    });
  }
};

const updateUplineBusiness = async (sponserId, amount) => {
  let currentUserId = sponserId;

  while (currentUserId) {
    const updatedUser = await UserModel.findByIdAndUpdate(
      currentUserId,
      { $inc: { totalBusiness: amount } },
      { new: true },
    );
    if (!updatedUser) break;

    console.log(
      "Updated totalBusiness:",
      updatedUser.username,
      updatedUser.totalBusiness,
    );

    currentUserId = updatedUser.sponserId;
  }
};
export const adminInvestment1 = async (req, res) => {
  try {
    const { investmentAmount, username } = req.body;

    if (!investmentAmount || !username) {
      return res.status(400).json({
        success: false,
        message: "investmentAmount and username are required",
      });
    }

    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const newInvestment = await Investment.create({
      userId: user._id,
      investmentAmount: investmentAmount,
      usdtAmount: investmentAmount,
      txHash: await generateRandomTxResponse(),
      addedBy: "admin",
      activeInvestment: investmentAmount,
      totalRoiEarned: 0,
      dayCount: 0,
      status: "active",
      investmentDate: new Date(),
    });

    user.investments.push(newInvestment._id);
    user.totalInvestment = (user.totalInvestment || 0) + investmentAmount;
    user.isVerified = true;
    user.status = true;
    user.activeDate = new Date();
    await user.save();
    if (user.sponserId) {
      const parentUser = await UserModel.findById(user.sponserId);
      if (parentUser) {
        const referralPercent = 5;
        const referralBonus = (investmentAmount * referralPercent) / 100;
        parentUser.directReferalAmount =
          (parentUser.directReferalAmount || 0) + referralBonus;
        parentUser.totalEarnings =
          (parentUser.totalEarnings || 0) + referralBonus;
        parentUser.currentEarnings =
          (parentUser.currentEarnings || 0) + referralBonus;
        await parentUser.save();
        await ReferalBonus.create({
          userId: parentUser._id,
          fromUser: user._id,
          amount: referralBonus,
          investmentId: newInvestment._id,
          percent: referralPercent,
          date: new Date(),
        });
      }
    }
    if (user.sponserId) {
      await updateUplineBusiness(user.sponserId, investmentAmount);
    }
    await distributeLevelIncomeOnRoi(user, investmentAmount, newInvestment._id);

    return res.status(201).json({
      success: true,
      message: "Package Purchased Successfully.",
      investment: newInvestment,
      activePlans: user.activePlans,
    });
  } catch (error) {
    console.error("Error in Investment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllSalaryIncomeHistory = async (req, res) => {
  try {
    const userId = req.admin._id;
    if (!userId) {
      return res.status(401).json({
        message: "You are not authorized",
      });
    }
    const salaryIncomeHistory = await MonthlyRewards.find()
      .populate("userId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "Salary Income History fetched successfully",
      data: salaryIncomeHistory,
    });
  } catch (error) {
    console.error("Error in getAllSalaryIncomeHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getCarFundingIncomeHistory = async (req, res) => {
  try {
    const userId = req.admin._id;
    if (!userId) {
      return res.status(401).json({
        message: "You are not authorized",
      });
    }
    const carFundingIncomeHistory = await OneTimeReward.find()
      .populate("userId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "Car Funding Income History fetched successfully",
      data: carFundingIncomeHistory,
    });
  } catch (error) {
    console.error("Error in getCarFundingIncomeHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getMatchingRewardHistory = async (req, res) => {
  try {
    const userId = req.admin._id;
    if (!userId) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    const matchingRewardHistory = await MatchingReward.find()
      .populate("userId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "Matching Reward History fetched successfully",
      data: matchingRewardHistory,
    });
  } catch (error) {
    console.error("Error in getMatchingRewardHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getCTOIncomeHistory = async (req, res) => {
  try {
    const userId = req.admin._id;
    if (!userId) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    const ctoIncomeHistory = await CTORewards.find()
      .populate("userId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "CTO Income History fetched successfully",
      data: ctoIncomeHistory,
    });
  } catch (error) {
    console.error("Error in getCTOIncomeHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getLeadershipIncomeHistory = async (req, res) => {
  try {
    const userId = req.admin._id;
    if (!userId) {
      return res.status(401).json({ message: "You are not authorized" });
    }
    const leadershipIncomeHistory = await LeadershipIncome.find()
      .populate("userId", "username")
      .populate("fromUserId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "Leadership Income History fetched successfully",
      data: leadershipIncomeHistory,
    });
  } catch (error) {
    console.error("Error in getLeadershipIncomeHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const adminInvestment = async (req, res) => {
  try {
    const { investmentAmount, username, packageName } = req.body;

    if (!investmentAmount || !username || !packageName) {
      return res.status(400).json({
        success: false,
        message: "username, investmentAmount and packageName are required",
      });
    }
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // find package by name
    const plan = await Package.findOne({ name: packageName });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }

    const usdtPriceInINR = await getUSDTPriceInINR();
    const odmPrice = await getODMPrice();

    const inrAmount = investmentAmount * usdtPriceInINR;
    const odmAmount = inrAmount / odmPrice;

    const newInvestment = await Investment.create({
      userId: user._id,
      investmentAmount: odmAmount,
      usdtAmount: investmentAmount,
      dailyROI: plan.dailyROI || plan.dailyROIStart,
      txHash: await generateRandomTxResponse(),
      activeInvestment: odmAmount,
      totalRoiEarned: 0,
      status: "active",
      name: plan.name,
      durationDays: plan.durationDays || 0,
      packageId: plan._id,
      addedBy: "admin",
      investmentDate: new Date(),
      roiDetails: [],
      usdtPrice: usdtPriceInINR,
      odmRate: odmPrice,
    });

    user.activePlans = user.activePlans || [];
    user.activePlans.push({
      planId: plan._id,
      name: plan.name,
      amount: investmentAmount,
      investmentId: newInvestment._id,
      date: new Date(),
    });

    user.investments.push(newInvestment._id);
    user.totalInvestment = (user.totalInvestment || 0) + investmentAmount;
    user.isVerified = true;
    user.status = true;
    user.activeDate = new Date();

    await user.save();

    // sponsor bonus
    if (user.sponserId) {
      const sponsor = await UserModel.findById(user.sponserId);

      if (sponsor) {
        const referralPercent = 1;
        const referralODM = (odmAmount * referralPercent) / 100;

        sponsor.directReferalAmount =
          (sponsor.directReferalAmount || 0) + referralODM;

        sponsor.totalEarnings = (sponsor.totalEarnings || 0) + referralODM;
        sponsor.currentEarnings = (sponsor.currentEarnings || 0) + referralODM;
        sponsor.mainWallet = (sponsor.mainWallet || 0) + referralODM;

        await sponsor.save();

        await ReferalBonus.create({
          userId: sponsor._id,
          fromUser: user._id,
          amount: referralODM,
          investmentId: newInvestment._id,
          percent: referralPercent,
          date: new Date(),
        });
      }
    }

    // update upline business
    await updateUplineBusiness(user.sponserId, investmentAmount);

    return res.status(201).json({
      success: true,
      message: "Admin Investment Successful",
      investment: newInvestment,
    });
  } catch (error) {
    console.error("Error in Admin Investment:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const changeUSDTPrice = async (req, res) => {
  try {
    const { usdtPrice } = req.body;
    if (!usdtPrice) {
      return res.status(400).json({
        success: false,
        message: "usdtPrice is required",
      });
    }
    await ODM.updateMany({}, { usdtPrice });
    return res.status(200).json({
      success: true,
      message: "USDT price updated successfully",
    });
  } catch (error) {
    console.error("Error in changeUSDTPrice:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getUSDTPrice = async (req, res) => {
  try {
    const usdtPrice = await ODM.findOne().lean();
    return res.status(200).json({
      success: true,
      message: "USDT price fetched successfully",
      data: usdtPrice,
    });
  } catch (error) {
    console.error("Error in getUSDTPrice:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const setODMPrice = async (req, res) => {
  try {
    const { odmPrice } = req.body;
    if (!odmPrice) {
      return res.status(400).json({
        success: false,
        message: "odmPrice is required",
      });
    }
    await ODM.updateMany({}, { price: odmPrice });
    return res.status(200).json({
      success: true,
      message: "ODM price updated successfully",
    });
  } catch (error) {
    console.error("Error in setODMPrice:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getODMPriceForAdmin = async (req, res) => {
  try {
    const odmPrice = await ODM.findOne().lean();
    return res.status(200).json({
      success: true,
      message: "ODM price fetched successfully",
      data: odmPrice,
    });
  } catch (error) {
    console.error("Error in getODMPrice:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const uploadQrCode = async (req, res) => {
  try {
    const file = req.file;
    const adminId = req.admin?._id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // ☁️ Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file);

    admin.qrCode = {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    };
    await admin.save();
    return res.status(200).json({
      success: true,
      message: "QR code and bank details uploaded successfully",
      data: {
        qrCode: admin.qrCode,
        bankName: admin.bankName,
        accountNumber: admin.accountNumber,
        ifscCode: admin.ifscCode,
      },
    });
  } catch (error) {
    console.error("❌ Error in uploadQrCode:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getQrCode = async (req, res) => {
  try {
    const user = await Admin.findOne().select(
      "qrCode bankName accountNumber ifscCode",
    );

    if (!user) {
      return res.status(404).json({
        message: "Admin not found",
        success: false,
      });
    }

    return res.status(200).json({
      data: user,
      success: true,
    });
  } catch (error) {
    console.error("Error in getQrCode:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
// export const buildUplineChain = async (userId) => {
//   try {
//     const result = await UserModel.aggregate([
//       {
//         $match: { _id: new mongoose.Types.ObjectId(userId) },
//       },
//       {
//         $graphLookup: {
//           from: "users",
//           startWith: "$sponserId",
//           connectFromField: "sponserId",
//           connectToField: "_id",
//           as: "uplines",
//           maxDepth: 10,
//           depthField: "level",
//         },
//       },
//       { $unwind: "$uplines" },
//       {
//         $project: {
//           userId: "$uplines._id",
//           level: { $add: ["$uplines.level", 1] },
//         },
//       },
//     ]);

//     return result;
//   } catch (error) {
//     console.error("Upline Chain Error:", error);
//     return [];
//   }
// };

// export const approveDeposit = async (req, res) => {
//   try {
//     const { id } = req.body;

//     const deposit = await DepositINR.findById(id);

//     if (!deposit || deposit.status !== "pending") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid deposit",
//       });
//     }

//     const user = await UserModel.findById(deposit.userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const amount = deposit.amount_inr;

//     // 🔥 build chain
//     const uplineChain = await buildUplineChain(user._id);

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // ✅ CREATE INVESTMENT
//     const investment = await Investment.create({
//       userId: user._id,
//       investmentAmount: amount,
//       dailyBaseAmount: amount,
//       totalDays: 20,
//       remainingDays: 20,
//       nextDistributionDate: today,
//       uplineChain,
//       addedBy: "user",
//     });

//     // ✅ UPDATE USER
//     await UserModel.findByIdAndUpdate(user._id, {
//       $push: { investments: investment._id },
//       $inc: {
//         totalInvestment: amount,
//         currentMonthTotalInvestment: amount,
//       },
//       $set: {
//         isVerified: true,
//         status: true,
//       },
//     });

//     // 🔥 UPDATE UPLINE BUSINESS
//     if (uplineChain.length > 0) {
//       const bulkOps = uplineChain.map((upline) => ({
//         updateOne: {
//           filter: { _id: upline.userId },
//           update: {
//             $inc: {
//               totalBusiness: amount,
//               levelBusiness: amount,
//             },
//           },
//         },
//       }));

//       await UserModel.bulkWrite(bulkOps);
//     }

//     // ✅ DIRECT REFERRAL BONUS
//     if (user.sponserId) {
//       const bonus = amount * 0.07;

//       await Promise.all([
//         UserModel.findByIdAndUpdate(user.sponserId, {
//           $inc: {
//             directReferalAmount: bonus,
//             totalEarnings: bonus,
//             currentEarnings: bonus,
//             mainWallet: bonus,
//           },
//         }),

//         ReferalBonus.create({
//           userId: user.sponserId,
//           fromUser: user._id,
//           amount: bonus.toFixed(2),
//           investmentId: investment._id,
//           baseAmount: deposit.amount_inr.toFixed(2),
//           percent: 7,
//         }),
//       ]);
//     }

//     // ✅ UPDATE DEPOSIT STATUS
//     deposit.status = "approved";
//     deposit.approvedAt = new Date();
//     deposit.approvedBy = req.admin._id;

//     await deposit.save();

//     return res.status(200).json({
//       success: true,
//       message: "Deposit approved & investment created",
//     });
//   } catch (err) {
//     console.error("Approve Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

export const approveDeposit = async (req, res) => {
  try {
    const { id } = req.body;

    const deposit = await DepositINR.findById(id);

    if (!deposit || deposit.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Invalid deposit",
      });
    }

    const user = await UserModel.findById(deposit.userId).select(
      "_id sponserId",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const amount = deposit.amount_inr;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const investment = await Investment.create({
      userId: user._id,
      investmentAmount: amount,
      dailyBaseAmount: amount,
      totalDays: 20,
      remainingDays: 20,
      nextDistributionDate: today,
      addedBy: "user",
    });

    await UserModel.findByIdAndUpdate(user._id, {
      $push: { investments: investment._id },
      $inc: {
        totalInvestment: amount,
        currentMonthTotalInvestment: amount,
      },
      $set: {
        isVerified: true,
        status: true,
      },
    });

    let sponsorIds = [];
    let current = user;

    while (current?.sponserId && sponsorIds.length < 20) {
      sponsorIds.push(current.sponserId);

      // ⚡ only fetch next sponsorId (light query)
      current = await UserModel.findById(current.sponserId).select("sponserId");
    }

    if (sponsorIds.length > 0) {
      const bulkOps = sponsorIds.map((id) => ({
        updateOne: {
          filter: { _id: id },
          update: {
            $inc: {
              totalBusiness: amount,
              levelBusiness: amount,
              currentMonthBusiness: amount,
            },
          },
        },
      }));

      await UserModel.bulkWrite(bulkOps);
    }
    const sponser = await UserModel.findById(user.sponserId);

    if (user.sponserId && sponser && sponser.isVerified === true) {
      const bonus = amount * 0.07;

      await Promise.all([
        UserModel.findByIdAndUpdate(user.sponserId, {
          $inc: {
            directReferalAmount: bonus,
            totalEarnings: bonus,
            currentEarnings: bonus,
            mainWallet: bonus,
          },
        }),

        ReferalBonus.create({
          userId: user.sponserId,
          fromUser: user._id,
          amount: bonus.toFixed(2),
          investmentId: investment._id,
          baseAmount: amount.toFixed(2),
          percent: 7,
        }),
      ]);
    }

    // ✅ UPDATE DEPOSIT
    deposit.status = "approved";
    deposit.approvedAt = new Date();
    deposit.approvedBy = req.admin._id;

    await deposit.save();

    return res.status(200).json({
      success: true,
      message: "Deposit approved & business updated",
    });
  } catch (err) {
    console.error("Approve Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const rejectDeposit = async (req, res) => {
  try {
    const { id, reason } = req.body;

    const deposit = await DepositINR.findById(id);
    if (!deposit) {
      return res.status(404).json({
        success: false,
        message: "Deposit not found",
      });
    }

    if (deposit.status === "rejected") {
      return res.status(400).json({
        success: false,
        message: "Already rejected",
      });
    }

    deposit.status = "rejected";
    deposit.response = reason || "Rejected by admin";
    await deposit.save();
    return res.status(200).json({
      success: true,
      message: "Deposit rejected successfully",
    });
  } catch (err) {
    console.error("Reject Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getAllDeposits = async (req, res) => {
  try {
    const deposits = await DepositINR.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username email")
      .lean();
    return res.status(200).json({
      success: true,
      data: deposits,
    });
  } catch (err) {
    console.error("Get All Deposits Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const adminTopup = async (req, res) => {
  try {
    const { username, amount } = req.body;

    if (!username || !amount) {
      return res.status(400).json({
        success: false,
        message: "Username and amount are required",
      });
    }
    const numericAmount = Number(amount);
    if (numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const user = await UserModel.findOne({ username }).select("_id sponserId");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ CREATE DEPOSIT RECORD
    await DepositINR.create({
      userId: user._id,
      amount_inr: numericAmount,
      paymentMethod: "adminTopup",
      status: "approved",
      approvedBy: req.admin._id,
      addedBy: "admin",
      approvedAt: new Date(),
    });

    const investment = await Investment.create({
      userId: user._id,
      investmentAmount: numericAmount,
      dailyBaseAmount: numericAmount,
      totalDays: 20,
      remainingDays: 20,
      nextDistributionDate: today,
      addedBy: "admin",
    });

    await UserModel.findByIdAndUpdate(user._id, {
      $push: { investments: investment._id },
      $inc: {
        totalInvestment: numericAmount,
        currentMonthTotalInvestment: numericAmount,
      },
      $set: {
        isVerified: true,
        status: true,
      },
    });

    let sponsorIds = [];
    let current = user;

    while (current?.sponserId && sponsorIds.length < 20) {
      sponsorIds.push(current.sponserId);
      current = await UserModel.findById(current.sponserId).select("sponserId");
    }

    if (sponsorIds.length > 0) {
      const bulkOps = sponsorIds.map((id) => ({
        updateOne: {
          filter: { _id: id },
          update: {
            $inc: {
              totalBusiness: numericAmount,
              levelBusiness: numericAmount,
              currentMonthBusiness: numericAmount,
            },
          },
        },
      }));

      await UserModel.bulkWrite(bulkOps);
    }

    if (user.sponserId) {
      const bonus = numericAmount * 0.07;

      await Promise.all([
        UserModel.findByIdAndUpdate(user.sponserId, {
          $inc: {
            directReferalAmount: bonus,
            totalEarnings: bonus,
            currentEarnings: bonus,
            mainWallet: bonus,
          },
        }),

        ReferalBonus.create({
          userId: user.sponserId,
          fromUser: user._id,
          amount: bonus.toFixed(2),
          investmentId: investment._id,
          baseAmount: numericAmount.toFixed(2),
          percent: 7,
        }),
      ]);
    }

    return res.status(200).json({
      success: true,
      message: `Topup of ${numericAmount} done for ${username}`,
    });
  } catch (err) {
    console.error("Admin Topup Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
import RewardHistoryModel from "../models/RewardHistory.model.js";

export const getRankRewardHistory = async (req, res) => {
  try {
    const adminId = req.admin;
    if (!adminId) {
      return res.status(404).json({
        message: "Unauthorized",
      });
    }
    const allHistory = await RewardHistoryModel.find({})
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "name username email",
      })
      .populate({
        path: "legDetails.legUser",
        select: "name email",
      });

    if (!allHistory || allHistory.length === 0) {
      return res.status(200).json({
        message: "No reward history found",
        success: true,
        data: [],
      });
    }
    return res.status(200).json({
      message: "Reward history fetched successfully",
      success: true,
      totalRewards: allHistory.length,
      totalAmount: allHistory.reduce((sum, r) => sum + r.rewardAmount, 0),
      data: allHistory,
    });
  } catch (error) {
    console.error("[REWARD HISTORY] Error:", error.message);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
