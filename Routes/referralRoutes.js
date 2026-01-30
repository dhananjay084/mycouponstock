import express from "express";
import {
  generateReferralLink,
  registerWithReferral,
  getMyReferrals,
} from "../Controllers/referralController.js";

const router = express.Router();

// ✅ generate referral link
router.get("/generate", generateReferralLink);

// ✅ register with referral
router.post("/register", registerWithReferral);

// ✅ get my referrals
router.get("/my-referrals", getMyReferrals);

export default router;
