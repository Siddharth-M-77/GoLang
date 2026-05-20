import {
  checkStatus,
  createDeposit,
  webhook,
} from "../controllers/deposit.controller.js";
import express from "express";
import IsAuthenticated from "../middlewares/IsAuthenticated.js";

const router = express.Router();
router.route("/create").post(IsAuthenticated, createDeposit);
router.route("/webhook").post(IsAuthenticated, webhook);
router.route("/status/:trackId").get(IsAuthenticated, checkStatus);

export default router;
