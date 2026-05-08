import express from "express";
import {
  generateReferralLink,
  registerWithReferral,
  getMyReferrals,
} from "../Controllers/referralController.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

// ✅ generate referral link
router.get("/generate", protect, generateReferralLink);

// ✅ register with referral
router.post("/register", registerWithReferral);

// ✅ get my referrals
router.get("/my-referrals", protect, getMyReferrals);

export default router;
