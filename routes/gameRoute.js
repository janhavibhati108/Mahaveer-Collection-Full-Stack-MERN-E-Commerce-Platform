// routes/gameRoute.js
import express from "express";
import { requiredSignIn } from "../middlewares/authMiddleware.js";
import { saveScore, getLeaderboard, applyCoupon, checkStatus } from "../controllers/gameController.js";

const router = express.Router();

router.post("/save-score", requiredSignIn, saveScore);
router.post("/check-status", requiredSignIn, checkStatus);  // 👈 new
router.post("/apply-coupon", applyCoupon);
router.get("/leaderboard", getLeaderboard);

export default router;