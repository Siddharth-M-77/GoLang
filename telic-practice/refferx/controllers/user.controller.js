import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { generateReferralCode } from "../utils/Random.js";
import { buildTree } from "../utils/BinaryTree.js";
import { getBinaryDownline } from "../utils/Downline.js";
import Investment from "../models/investment.model.js";
import Aroi from "../models/roi.model.js";
import Plan from "../models/plan.model.js";
import Support from "../models/support.model.js";
import Withdrawal from "../models/withdrwal.model.js";
import LevelIncome from "../models/LevelIncome.model.js";
import ReferalBonus from "../models/referalbonus.model.js";
import OneTimeReward from "../models/oneTime.model.js";
import MonthlyRewards from "../models/monthlyRewards.js";
import Package from "../models/Package.model.js";
import bcrypt from "bcryptjs";
import MatchingReward from "../models/matchingreward.model.js";
import CTORewards from "../models/CTORewards.js";
import { getODMPrice, getUSDTPriceInINR } from "../utils/cryptoUtils.js";
import LeadershipIncome from "../models/Leadershipincome.model.js";
import mongoose from "mongoose";
import ODM from "../utils/odm.model.js";
import Swap from "../models/swap.model.js";
import {
  sendPackagePurchaseEmail,
  sendWelcomeEmail,
} from "../utils/sendMail.js";
import DepositINR from "../models/DepositINR.model.js";
import Admin from "../models/admin.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import RewardHistoryModel from "../models/RewardHistory.model.js";
export const userRegister = async (req, res) => {
  try {
    const { walletAddress, referredBy } = req.body;

    const referralCode = generateReferralCode();
    const username = referralCode;

    const userCount = await UserModel.countDocuments();
    let role = "user";
    let sponsorId = null;

    if (userCount === 0) {
      role = "user";
    } else {
      if (!referredBy) {
        return res.status(400).json({
          success: false,
          message: "Referral ID is required for registration.",
        });
      }
      const sponsorUser = await UserModel.findOne({ referralCode: referredBy });
      if (!sponsorUser) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral ID",
        });
      }
      sponsorId = sponsorUser._id;
    }

    const newUser = new UserModel({
      referralCode,
      sponserId: sponsorId,
      walletAddress: walletAddress.toLowerCase(),
      role,
      username,
      parentReferedCode: referredBy || null,
    });

    const savedUser = await newUser.save();

    if (sponsorId) {
      await UserModel.findByIdAndUpdate(sponsorId, {
        $push: { referedUsers: savedUser._id },
      });
    }

    const user = await UserModel.findById(savedUser._id).populate(
      "referedUsers",
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    // await sendWelcomeEmail(email, username, password);
    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
      })
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        user: { data: user },
        token,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const userLogin = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "walletAddress is required",
      });
    }

    const user = await UserModel.findOne({
      walletAddress: walletAddress.toLowerCase(),
    }).populate("referedUsers");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Please Use Correct Wallet Address or Register Yourself",
      });
    }

    if (user.isLoginBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your login has been blocked. Please contact support.",
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res
      .cookie("token", token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: false,
        sameSite: "none",
      })
      .status(200)
      .json({
        success: true,
        token,
        data: user,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const userLogout = async (req, res) => {
  try {
    res.clearCookie("token", { path: "/" });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const buildUplineChain = async (userId, maxLevel = 10) => {
  const chain = [];

  let current = await UserModel.findById(userId).select("sponserId");

  let level = 1;

  while (current?.sponserId && level <= maxLevel) {
    chain.push({
      userId: current.sponserId,
      level,
    });

    current = await UserModel.findById(current.sponserId).select("sponserId");

    level++;
  }

  return chain;
};

const updateUplineBusiness = async (uplineChain, amount) => {
  try {
    const bulkOps = uplineChain.map((upline) => ({
      updateOne: {
        filter: { _id: upline.userId },
        update: {
          $inc: {
            totalBusiness: amount,
            levelBusiness: amount,
          },
        },
      },
    }));

    if (bulkOps.length) {
      await UserModel.bulkWrite(bulkOps);
    }
  } catch (err) {
    console.error("❌ Upline Business Error:", err);
  }
};
export const investment = async (req, res) => {
  try {
    const { investmentAmount } = req.body;

    if (!investmentAmount || !txHash) {
      return res.status(400).json({
        success: false,
        message: "investmentAmount ",
      });
    }

    const userId = req.user._id;

    // ✅ user fetch
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const amount = Number(investmentAmount);

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    // 🔥 build upline chain (IMPORTANT)
    const uplineChain = await buildUplineChain(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ✅ create investment
    const newInvestment = await Investment.create({
      userId,
      investmentAmount: amount,
      dailyBaseAmount: amount,
      totalDays: 20,
      remainingDays: 20,
      nextDistributionDate: today,
      uplineChain,
      addedBy: "user",
    });

    await UserModel.findByIdAndUpdate(userId, {
      $push: { investments: newInvestment._id },
      $inc: {
        totalInvestment: amount,
        currentMonthTotalInvestment: amount,
      },
      $set: {
        isVerified: true,
        status: true,
      },
    });

    if (uplineChain.length > 0) {
      const bulkOps = uplineChain.map((upline) => ({
        updateOne: {
          filter: { _id: upline.userId },
          update: {
            $inc: {
              totalBusiness: amount,
              levelBusiness: amount,
            },
          },
        },
      }));

      await UserModel.bulkWrite(bulkOps);
    }

    // ✅ DIRECT REFERRAL BONUS (₹50 fixed)
    if (user.sponserId) {
      const bonus = 50;

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
          fromUser: userId,
          amount: bonus,
          investmentId: newInvestment._id,
          percent: 0,
        }),
      ]);
    }

    return res.status(201).json({
      success: true,
      message: "Investment successful.Enjoy your Earnings!",
      investment: newInvestment,
    });
  } catch (err) {
    console.error("Investment Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const depositInInr = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { investmentAmount, paymentMethod } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!investmentAmount || investmentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount required",
      });
    }

    if (!["UPI"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Payment proof required",
      });
    }

    const upload = await uploadToCloudinary(file);

    const deposit = await DepositINR.create({
      userId,
      amount_inr: Number(investmentAmount),
      paymentMethod,
      status: "pending",
      proofImage: {
        url: upload.url,
        public_id: upload.public_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Deposit submitted, waiting for admin approval",
      depositId: deposit._id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTotalRoi = async (req, res) => {
  try {
    const userId = req.user._id;
    const rois = await Aroi.find({ userId });
    const totalRoi = rois.reduce((acc, item) => acc + item.roiAmount, 0);
    res.status(200).json({ success: true, totalRoi });
  } catch (error) {
    console.error("Error in getTotalRoi:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const userProfile = await UserModel.findById(userId)
      .populate("referedUsers")
      .populate("sponserId", "name");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: userProfile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getBinaryTree = async (req, res) => {
  try {
    const User = req.user;
    const userId = User._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const tree = await buildTree(user._id);

    res.json({ success: true, tree });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getDowunlineUsers = async (req, res) => {
  try {
    const User = req.user;
    const userId = User._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const downline = await getBinaryDownline(user._id);

    res.json({ success: true, downline });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllPlan = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json({ success: true, data: plans });
  } catch (error) {}
};
export const helpAndSupport = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const { message, subject } = req.body;
    if (!message || !subject) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (req.file) {
      const upload = await uploadToCloudinary(req.file);
      console.log("Uploaded proof image:", upload);
      req.body.proofImage = {
        url: upload.url,
        public_id: upload.public_id,
      };
    }
    const support = await Support.create({
      userId,
      message,
      subject,
      createdAt: new Date(),
      proofImage: req.body.proofImage || null,
    });
    await support.save();
    res
      .status(201)
      .json({ success: true, message: "Support request sent Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getAllHelpAndSupportHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const supportHistory = await Support.find({ userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: supportHistory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getreferalHistoryByID = async (req, res) => {
  try {
    const userId = req.user?._id || req.admin?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const referalHistory = await ReferalBonus.find({ userId })
      .populate([
        { path: "userId", select: "username email name" },
        { path: "fromUser", select: "username email name" },
      ])
      .sort({ createdAt: -1 })
      .lean();

    if (!referalHistory || referalHistory.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No referral history found for this user.",
      });
    }

    res.json({ success: true, data: referalHistory });
  } catch (error) {
    console.error("Error fetching referral history:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getInvestmentHistoryById = async (req, res) => {
  try {
    const userId = req.user?._id || req.admin?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const investmentsHistory = await Investment.find({
      userId: userId,
    })
      .populate("userId", "username name")
      .populate("packageId")
      .sort({ createdAt: -1 });
    if (!investmentsHistory || investmentsHistory.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No investment history found for this user.",
      });
    }

    res.json({ success: true, data: investmentsHistory });
  } catch (error) {
    console.error("Error getting investment history:", error);
    return res.status(500).json({
      message: "Server error",
      success: false,
    });
  }
};
export const getRoiIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const getRois = await Aroi.find({ userId })
      .populate("userId", "username name")
      .populate("investmentId")
      .sort({ createdAt: -1 });

    if (!getRois || getRois.length === 0) {
      return res.status(200).json({
        message: "No Roi history found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Roi History Fetched",
      success: true,
      data: getRois,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getLevelIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }

    const levelIncomesReport = await LevelIncome.find({ userId })
      .populate("fromUserId", "username email name")
      .sort({ createdAt: -1 })
      .lean();

    if (levelIncomesReport.length === 0) {
      return res.status(200).json({
        message: "No Level Income History Found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Level Income History Reports",
      data: levelIncomesReport,
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getUsersCountByLevel = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // 🔥 fetch minimal required users only (optimization)
    const allUsers = await UserModel.find(
      {},
      {
        _id: 1,
        referedUsers: 1,
        username: 1,
        referralCode: 1,
        walletAddress: 1,
        totalInvestment: 1,
        email: 1,
        totalEarnings: 1,
        createdAt: 1,
        totalBusiness: 1,
        isVerified: 1,
      },
    ).lean();

    // 🔥 map for O(1) lookup
    const userMap = new Map();
    allUsers.forEach((u) => {
      userMap.set(u._id.toString(), u);
    });

    let currentLevelUsers = [userId];
    const visited = new Set([userId]);
    const levelCounts = [];

    for (let level = 1; level <= 10; level++) {
      let nextLevel = [];

      // 🔥 BFS traversal
      for (const uid of currentLevelUsers) {
        const user = userMap.get(uid);
        if (!user || !user.referedUsers) continue;

        for (const refId of user.referedUsers) {
          const idStr = refId.toString();

          if (!visited.has(idStr)) {
            visited.add(idStr);
            nextLevel.push(idStr);
          }
        }
      }

      // 🔥 STOP if no users (IMPORTANT FIX)
      if (nextLevel.length === 0) break;

      const users = nextLevel.map((id) => userMap.get(id)).filter(Boolean);

      levelCounts.push({
        level,
        count: users.length,
        users,
      });

      currentLevelUsers = nextLevel;
    }

    return res.status(200).json({
      success: true,
      data: levelCounts,
    });
  } catch (error) {
    console.error("Error in getUsersCountByLevel:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
export const withdrawalHistory = async (req, res) => {
  try {
    const userId = req.user;
    const allWithdrwal = await Withdrawal.find({ userId: userId })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean();
    if (!allWithdrwal) {
      return res.status(200).json({
        message: "No withdrwal History Found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Withdrwal History Fetched",
      success: true,
      data: allWithdrwal,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};
export const getAllTeamRewardsHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authorized",
      });
    }
    const teamRewardsHistory = await OneTimeReward.find({ userId })
      .lean()
      .populate("userId", "username")
      .select("amount creditedOn milestone")
      .exec();

    if (teamRewardsHistory.length === 0) {
      return res.status(200).json({
        message: "No Rewards History found",
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      message: "Rewards history fetched successfully",
      success: true,
      data: teamRewardsHistory,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in Getting Team Rewards History",
      success: false,
    });
  }
};
export const getAllMonthlyRewardsHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(401).json({
        message: "User is not authorized",
      });
    }

    const history = await MonthlyRewards.find({ userId })
      .populate("userId", "username")
      .select("amount creditedOn rewardTier level1 level2 level3");

    if (history.length === 0) {
      return res.status(200).json({
        message: "No Monthly Rewards History found",
        success: true,
        data: [],
      });
    }

    return res.status(200).json({
      message: "Monthly Rewards History fetched",
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in getting Monthly Rewards History",
      success: false,
    });
  }
};
export const claimRoi = async (req, res) => {
  try {
    const userId = req.user._id;
    const User = await UserModel.findById(userId);

    if (!User) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }
    if (User.totalInvestment === 0) {
      return res.status(200).json({
        message: "You have no investment and cannot claim ROI",
        success: false,
      });
    }
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const tomorrowStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    const roiEntry = await Aroi.findOne({
      userId,
      creditedOn: { $gte: todayStart, $lt: tomorrowStart },
      isClaimed: false,
    });

    if (!roiEntry) {
      return res
        .status(200)
        .json({ message: "ROI already claimed or not available for today." });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.dailyRoi = (user.dailyRoi || 0) + roiEntry.roiAmount;
    user.totalRoi = (user.totalRoi || 0) + roiEntry.roiAmount;
    user.totalEarnings = (user.totalEarnings || 0) + roiEntry.roiAmount;
    user.currentEarnings = (user.currentEarnings || 0) + roiEntry.roiAmount;

    await user.save();

    roiEntry.isClaimed = true;
    await roiEntry.save();

    res.status(200).json({
      message: "Today's Trade Profit is claimed successfully.",
      roiAmount: roiEntry.roiAmount,
      success: true,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Please try after sometime", success: false });
  }
};

export const getTeamBusiness = async (req, res) => {
  try {
    const userId = req.user._id;

    const levels = {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: [],
    };

    const levelBusiness = {
      level1Business: 0,
      level2Business: 0,
      level3Business: 0,
      level4Business: 0,
      level5Business: 0,
    };

    const teamBusinessPerLevel = [];
    let totalTeamBusiness = 0;

    let currentLevelUserIds = [userId];

    for (let level = 1; level <= 5; level++) {
      // ✅ Populate sponsor info
      const users = await UserModel.find({
        sponserId: { $in: currentLevelUserIds },
      })
        .select("_id username email totalInvestment sponserId")
        .populate({
          path: "sponserId",
          select: "username",
        });

      if (users.length === 0) break;

      // ✅ Format each user with sponsor username
      const formattedUsers = users.map((user) => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        totalInvestment: user.totalInvestment || 0,
        sponsorUsername: user.sponserId?.username || "N/A",
      }));

      levels[`level${level}`] = formattedUsers;

      const levelBusinessAmount = formattedUsers.reduce(
        (acc, user) => acc + (user.totalInvestment || 0),
        0,
      );
      levelBusiness[`level${level}Business`] = levelBusinessAmount;

      teamBusinessPerLevel.push({
        level: `Level ${level}`,
        business: levelBusinessAmount,
        userCount: formattedUsers.length,
      });

      totalTeamBusiness += levelBusinessAmount;

      currentLevelUserIds = users.map((u) => u._id);
    }

    return res.status(200).json({
      success: true,
      message: "Team business fetched successfully",
      ...levels,
      ...levelBusiness,
      teamBusinessPerLevel,
      totalTeamBusiness,
    });
  } catch (error) {
    console.error("Error in getTeamBusiness:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
export const getAllPackagesForClient = async (req, res) => {
  try {
    const packages = await Package.find();
    return res.status(200).json({
      success: true,
      message: "Packages fetched successfully",
      data: packages,
    });
  } catch (error) {
    console.error("Error in getAllPackages:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getDirectActiveTeam = async (req, res) => {
  try {
    const userId = req.user._id;
    const directActiveTeam = await UserModel.countDocuments({
      sponserId: userId,
      isVerified: true,
      totalInvestment: { $gte: 100 },
    }).select("_id username email");
    return res.status(200).json({
      success: true,
      message: "Direct active team fetched successfully",
      data: directActiveTeam,
    });
  } catch (error) {
    console.error("Error in getDirectActiveTeam:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getCarFundingIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const carFundingIncomeHistory = await OneTimeReward.find({ userId }).lean();

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

export const addWalletAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { walletAddress } = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: "You are already added your wallet address.",
      });
    }
    user.walletAddress = walletAddress;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Wallet address added successfully",
    });
  } catch (error) {
    console.error("Error in addWalletAddress:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getMatchingReward = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "You are not authorized",
      });
    }
    const matchingRewardHistory = await MatchingReward.find({
      userId: userId,
    })
      .populate("userId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "Matching Reward History fetched successfully",
      data: matchingRewardHistory,
    });
  } catch (error) {
    console.error("Error in getMatchingReward:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getCtoIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const ctoIncomeHistory = await CTORewards.find({ userId })
      .lean()
      .populate("userId", "username");
    return res.status(200).json({
      success: true,
      message: "CTO Income History fetched successfully",
      data: ctoIncomeHistory,
    });
  } catch (error) {
    console.error("Error in getCtoIncomeHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getLeadershipIncomeHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const leadershipIncomeHistory = await LeadershipIncome.find({ userId })
      .lean()
      .populate("userId", "username")
      .populate("fromUserId", "username");
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

export const getAllTeam = async (req, res) => {
  try {
    const userId = req.user._id;
    const allTeam = await calculateTeamsForTeamPage(userId);

    return res.status(200).json({
      success: true,
      message: "Team fetched successfully",
      data: allTeam,
    });
  } catch (error) {
    console.error("Error fetching team:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const getUserTeamTree = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId required",
      });
    }

    const user = await UserModel.findById(userId).select(
      "username name  referedUsers walletAddress mainWallet totalInvestment isVerified",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const children = await UserModel.find({
      _id: { $in: user.referedUsers },
    }).select(
      "_id username name walletAddress mainWallet totalInvestment isVerified referedUsers",
    );

    const formatted = children.map((child) => ({
      id: child._id,
      name: child.name,
      username: child.username,
      investment: child.totalInvestment || 0,
      wallet: child.mainWallet || 0,
      walletAddress: child.walletAddress,
      verified: child.isVerified,
      hasChildren: child.referedUsers && child.referedUsers.length > 0,
    }));

    return res.status(200).json({
      success: true,
      parent: {
        id: user._id,
        username: user.username,
        name: user.name,
        walletAddress: user.walletAddress,
        investment: user.totalInvestment || 0,
        verified: user.isVerified,
        hasChildren: user.referedUsers && user.referedUsers.length > 0,
      },
      team: formatted,
    });
  } catch (error) {
    console.error("Team tree error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUserTeamTreeForDirectForDashboard = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId required",
      });
    }

    const user = await UserModel.findById(userId).select(
      "username  referedUsers walletAddress mainWallet totalInvestment isVerified",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // get direct team
    const children = await UserModel.find({
      _id: { $in: user.referedUsers },
    }).select(
      "_id username walletAddress mainWallet totalInvestment isVerified referedUsers",
    );

    const formatted = children.map((child) => ({
      id: child._id,
      username: child.username,
      walletAddress: child.walletAddress,
      investment: child.totalInvestment || 0,
      wallet: child.mainWallet || 0,
      verified: child.isVerified,
      hasChildren: child.referedUsers && child.referedUsers.length > 0,
    }));

    return res.status(200).json({
      success: true,
      parent: {
        id: user._id,
        username: user.username,
        walletAddress: user.walletAddress,
      },
      team: formatted,
    });
  } catch (error) {
    console.error("Team tree error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUserTeam25Levels = async (req, res) => {
  try {
    const userId = req.user._id;

    const data = await UserModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $graphLookup: {
          from: "usermodels",
          startWith: "$referedUsers",
          connectFromField: "referedUsers",
          connectToField: "_id",
          as: "team",
          depthField: "level",
          maxDepth: 24,
        },
      },
      {
        $project: {
          team: 1,
        },
      },
    ]);

    if (!data.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const team = data[0].team;

    // 🔥 STEP 1: Map for quick lookup
    const userMap = new Map();
    team.forEach((u) => {
      userMap.set(u._id.toString(), u);
    });

    // 🔥 STEP 2: Initialize extra fields
    team.forEach((u) => {
      u.teamCount = 0;
      u.validTeamCount = 0;
    });

    // 🔥 STEP 3: Reverse traversal for team count (bottom-up)
    const sortedDesc = [...team].sort((a, b) => b.level - a.level);

    sortedDesc.forEach((user) => {
      if (user.referedUsers && user.referedUsers.length > 0) {
        user.referedUsers.forEach((childId) => {
          const child = userMap.get(childId.toString());
          if (child) {
            user.teamCount += 1 + child.teamCount;
            user.validTeamCount +=
              (child.isVerified ? 1 : 0) + child.validTeamCount;
          }
        });
      }
    });

    // 🔥 STEP 4: Level-wise grouping + business calc
    const levelMap = {};

    team.forEach((user) => {
      const level = user.level + 1;

      if (!levelMap[level]) {
        levelMap[level] = {
          users: [],
          totalBusiness: 0,
          totalUsers: 0,
          totalVerified: 0,
        };
      }

      const userBusiness =
        (user.totalBusiness || 0) + (user.totalInvestment || 0);

      levelMap[level].users.push({
        _id: user._id,
        username: user.username,
        totalInvestment: user.totalInvestment,
        totalBusiness: user.totalBusiness,
        isVerified: user.isVerified,
        rank: user.rank,
        totalEarnings: user.totalEarnings,

        // 🔥 NEW FIELDS
        teamCount: user.teamCount,
        validTeamCount: user.validTeamCount,
        business: userBusiness,
      });

      levelMap[level].totalBusiness += userBusiness;
      levelMap[level].totalUsers += 1;
      if (user.isVerified) levelMap[level].totalVerified += 1;
    });

    // 🔥 STEP 5: Final result
    const result = Object.keys(levelMap)
      .sort((a, b) => a - b)
      .map((lvl) => ({
        level: Number(lvl),
        totalUsers: levelMap[lvl].totalUsers,
        totalVerified: levelMap[lvl].totalVerified,
        totalBusiness: levelMap[lvl].totalBusiness,
        users: levelMap[lvl].users,
      }));

    res.status(200).json({
      success: true,
      totalLevels: result.length,
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

async function getDirectLegsBusiness(user) {
  const legs = [];

  for (let referred of user.referedUsers) {
    const business =
      (referred.totalInvestment || 0) + (referred.totalBusiness || 0);

    legs.push(business);
  }

  return legs;
}

export const getTotalBusiness = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await UserModel.findById(userId).populate("referedUsers");

    let legs = await getDirectLegsBusiness(user);

    // highest business first
    legs.sort((a, b) => b - a);

    const leg1 = legs[0] || 0;
    const leg2 = legs[1] || 0;

    // remaining legs combined
    const leg3 = legs.slice(2).reduce((sum, val) => sum + val, 0);

    res.status(200).json({
      success: true,
      leg1: { totalBusiness: leg1 },
      leg2: { totalBusiness: leg2 },
      leg3: { totalBusiness: leg3 },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const swapODMToUSDT = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const { usdt, odmAmount, feeOdm } = req.body;

    if (Number(odmAmount) > user.currentEarnings) {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient ODM balance" });
    }
    user.currentEarnings -= odmAmount;
    user.usdtEarnings += Number(usdt);
    await user.save();
    await Swap.create({
      userId,
      usdt,
      odmAmount,
      feeOdm,
      status: "Approved",
    });
    return res
      .status(200)
      .json({ success: true, message: "Swap successful with USDT" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUSDTPrice = async (req, res) => {
  try {
    const data = await ODM.findOne().lean();
    return res.status(200).json({
      success: true,
      message: "USDT price fetched successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error in getUSDTPrice:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getSwapHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const swapHistory = await Swap.find({ userId })
      .populate("userId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "Swap history fetched successfully",
      data: swapHistory,
    });
  } catch (error) {
    console.error("Error in getSwapHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getUserDirectTeam = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const allUsers = await UserModel.find({ sponserId: userId }).select(
      "_id username email referralCode totalEarnings totalInvestment isVerified createdAt",
    );
    if (!allUsers) {
      return res.status(200).json({
        message: "No user Found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Direct Team Fetched",
      success: false,
      data: allUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Server Error",
      success: false,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, walletAddress } = req.body;
    const file = req.file;
    console.log(req.file);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updateData = {};

    if (email) updateData.email = email;
    if (walletAddress) updateData.walletAddress = walletAddress;

    // 🖼 new image upload
    if (file) {
      updateData.profileImage = file.path;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, {
      new: true,
    });

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getQrCode = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const qrLink = await Admin.find().lean();
    if (!qrLink) {
      return res.status(404).json({
        success: false,
        message: "Admin data not found",
      });
    }
    const qrCode = qrLink[0]?.qrCode;
    const qrCodeLink = qrCode?.url;
    res.json({
      success: true,
      qrCode: qrCodeLink,
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getDepositHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const depositHistory = await DepositINR.find({ userId })
      .populate("userId", "username")
      .lean();
    return res.status(200).json({
      success: true,
      message: "Deposit history fetched successfully",
      data: depositHistory,
    });
  } catch (error) {
    console.error("Error in getDepositHistory:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getUserInfo = async (req, res) => {
  try {
    const { userName } = req.body;
    const user = await UserModel.findOne({ username: userName })
      .select("username email  totalInvestment totalEarnings referralCode")
      .lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User info fetched successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getRankRewardHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    const allHistory = await RewardHistoryModel.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: "name username",
      })
      .populate({
        path: "legDetails.legUser",
        select: "username email name",
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

export const getUserTeamTreeForDirect = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "UserId required",
      });
    }

    const user = await UserModel.findById(userId).select(
      "username name referedUsers walletAddress mainWallet totalInvestment isVerified",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // get direct team
    const children = await UserModel.find({
      _id: { $in: user.referedUsers },
    }).select(
      "_id username name walletAddress mainWallet totalInvestment isVerified referedUsers",
    );

    const formatted = children.map((child) => ({
      id: child._id,
      username: child.username,
      name: child.name,
      walletAddress: child.walletAddress,
      investment: child.totalInvestment || 0,
      wallet: child.mainWallet || 0,
      verified: child.isVerified,
      hasChildren: child.referedUsers && child.referedUsers.length > 0,
    }));

    return res.status(200).json({
      success: true,
      parent: {
        id: user._id,
        username: user.username,
        walletAddress: user.walletAddress,
        investment: user.totalInvestment || 0,
        wallet: user.mainWallet || 0,
        verified: user.isVerified,
      },
      team: formatted,
    });
  } catch (error) {
    console.error("Team tree error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
