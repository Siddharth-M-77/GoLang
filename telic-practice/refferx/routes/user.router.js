import express from "express";
import {
  addWalletAddress,
  getAllHelpAndSupportHistory,
  getAllMonthlyRewardsHistory,
  getAllPackagesForClient,
  getAllPlan,
  getAllTeamRewardsHistory,
  getBinaryTree,
  getCarFundingIncomeHistory,
  getCtoIncomeHistory,
  getDirectActiveTeam,
  getInvestmentHistoryById,
  getLeadershipIncomeHistory,
  getLevelIncomeHistory,
  getMatchingReward,
  getProfile,
  getreferalHistoryByID,
  getRoiIncomeHistory,
  getSwapHistory,
  getTeamBusiness,
  getTotalBusiness,
  getUSDTPrice,
  getUsersCountByLevel,
  getUserTeam25Levels,
  getUserTeamTree,
  getUserTeamTreeForDirect,
  helpAndSupport,
  investment,
  swapODMToUSDT,
  userLogin,
  userLogout,
  userRegister,
  withdrawalHistory,
  getUserDirectTeam,
  updateProfile,
  depositInInr,
  getQrCode,
  getDepositHistory,
  getRankRewardHistory,
} from "../controllers/user.controller.js";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";
import { processWithdrawal } from "../controllers/withdrwal.controller.js";
import { getBanners } from "../controllers/admin.controller.js";
import upload from "../middlewares/upload.js";
import bannerUpload from "../utils/multer.js";
// import { claimDailyROI } from "../utils/distributeDailyROI.js";

const router = express.Router();
router.route("/register").post(userRegister);
router.route("/login").post(userLogin);
router.route("/logout").post(IsAuthenticated, userLogout);
router.route("/get-Profile").get(IsAuthenticated, getProfile);
router
  .route("/update-profile")
  .put(IsAuthenticated, upload.single("file"), updateProfile);

router.route("/get-direct-team").get(IsAuthenticated, getUserDirectTeam);
router.route("/get-level-team").get(IsAuthenticated, getUsersCountByLevel);

router
  .route("/get-referral-income")
  .get(IsAuthenticated, getreferalHistoryByID);
router.route("/get-roi-income").get(IsAuthenticated, getRoiIncomeHistory);
router.route("/get-level-income").get(IsAuthenticated, getLevelIncomeHistory);

router.route("/withdrawal-request").post(IsAuthenticated, processWithdrawal);
router.get("/withdrawals-history", IsAuthenticated, withdrawalHistory);

router.route("/get-packages").get(getAllPlan);
router.route("/buy-package").post(IsAuthenticated, investment);
router
  .route("/investment-history")
  .get(IsAuthenticated, getInvestmentHistoryById);

router.route("/get-binary").get(IsAuthenticated, getBinaryTree);
router
  .route("/support/create")
  .post(IsAuthenticated, upload.single("file"), helpAndSupport);
router
  .route("/support/messages")
  .get(IsAuthenticated, getAllHelpAndSupportHistory);
router.get("/get-banners", getBanners);
router.get(
  "/monthlyIncome-history",
  IsAuthenticated,
  getAllMonthlyRewardsHistory,
);
router.get("/teamReward-history", IsAuthenticated, getAllTeamRewardsHistory);
// router.get("/claim-roi", IsAuthenticated, claimDailyROI);
router.route("/team-business").get(IsAuthenticated, getTeamBusiness);
router.route("/get-plans").get(IsAuthenticated, getAllPackagesForClient);
router
  .route("/get-car-funding-history")
  .get(IsAuthenticated, getCarFundingIncomeHistory);
router
  .route("/get-active-direct-team")
  .get(IsAuthenticated, getDirectActiveTeam);
router.route("/add-wallet-address").post(IsAuthenticated, addWalletAddress);
router.route("/get-matching-reward").get(IsAuthenticated, getMatchingReward);
router.route("/get-cto-history").get(IsAuthenticated, getCtoIncomeHistory);
router
  .route("/get-leadership-income-history")
  .get(IsAuthenticated, getLeadershipIncomeHistory);
router.route("/get-my-binary-tree").get(IsAuthenticated, getUserTeamTree);
router
  .route("/get-my-binary-tree/:userId")
  .get(IsAuthenticated, getUserTeamTreeForDirect);
router.route("/get-level-wise-team").get(IsAuthenticated, getUserTeam25Levels);
router.route("/get-total-business").get(IsAuthenticated, getTotalBusiness);
router.route("/get-price").get(IsAuthenticated, getUSDTPrice);
router.route("/swap-odm").post(IsAuthenticated, swapODMToUSDT);
router.route("/swap-history").get(IsAuthenticated, getSwapHistory);
router.route("/get-qr").get(IsAuthenticated, getQrCode);
router.route("/get-deposit-history").get(IsAuthenticated, getDepositHistory);
router.route("/get-reward-history").get(IsAuthenticated, getRankRewardHistory);
router
  .route("/make-investment")
  .post(IsAuthenticated, bannerUpload.single("file"), depositInInr);

export default router;
