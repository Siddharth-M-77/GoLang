import mongoose from "mongoose";

const activePlanSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
  },
  name: {
    type: String,
  },
  amount: {
    type: Number,
  },

  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Investment",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const userSchema = new mongoose.Schema(
  {
    totalBusiness: {
      type: Number,
      default: 0,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    carryForward: {
      type: Number,
      default: 0,
    },
    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
    },
    rank: {
      type: String,
    },
    leadershipPercent: {
      type: Number,
      default: 0,
    },
    matchingIncome: {
      type: Number,
      default: 0,
    },

    name: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
    },

    walletAddress: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    status: {
      type: Boolean,
      default: false,
    },

    isLoginBlocked: {
      type: Boolean,
      default: false,
    },

    sponserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },

    parentReferedCode: {
      type: String,
      default: null,
    },

    left: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },
    leftBusiness: {
      type: Number,
      default: 0,
    },

    rightBusiness: {
      type: Number,
      default: 0,
    },

    right: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      default: null,
    },

    position: {
      type: String,
      default: null,
    },

    referedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],

    investments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Investment",
      },
    ],

    activePlans: [activePlanSchema],

    totalInvestment: {
      type: Number,
      default: 0,
    },

    activeDate: {
      type: Date,
      default: null,
    },

    // EARNINGS
    totalEarnings: {
      type: Number,
      default: 0,
    },

    currentEarnings: {
      type: Number,
      default: 0,
    },

    totalPayouts: {
      type: Number,
      default: 0,
    },

    // ROI
    dailyRoi: {
      type: Number,
      default: 0,
    },

    totalRoi: {
      type: Number,
      default: 0,
    },

    // MLM INCOME
    levelIncome: {
      type: Number,
      default: 0,
    },

    directReferalAmount: {
      type: Number,
      default: 0,
    },

    teamRewards: {
      type: Number,
      default: 0,
    },

    teamRewards: {
      type: Number,
      default: 0,
    },

    teamRewardsget: {
      type: Boolean,
      default: false,
    },

    // MONTHLY REWARDS
    monthlyRewards: {
      type: Number,
      default: 0,
    },

    totalMonthlyRewards: {
      type: Number,
      default: 0,
    },

    lastRewardMilestone: {
      type: Number,
      default: 0,
    },

    lastSalaryPaidDate: {
      type: Date,
      default: null,
    },
    leadershipAchievedDate: {
      type: Date,
      default: null,
    },
    leadership: {
      type: Boolean,
      default: false,
    },
    currentMonthBusiness: {
      type: Number,
      default: 0,
    },
    currentMonthTotalInvestment: {
      type: Number,
      default: 0,
    },

    // WITHDRAWAL
    canWithdraw: {
      type: Boolean,
      default: false,
    },

    withdrawalCount: {
      type: Number,
      default: 0,
    },

    lastWithdrawalDate: {
      type: Date,
    },

    profileImage: {
      type: String,
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model("UserModel", userSchema);

export default UserModel;
