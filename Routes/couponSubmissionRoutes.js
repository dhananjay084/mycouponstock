import { Router } from "express";
import {
  createCouponSubmission,
  getCouponSubmissions,
  approveCouponSubmission,
  rejectCouponSubmission,
  updateCouponSubmission,
} from "../Controllers/couponSubmissionController.js";
import { requireAdmin } from "../middleware/authmiddleware.js";

const router = Router();

router.post("/", createCouponSubmission);
router.get("/", requireAdmin, getCouponSubmissions);
router.patch("/:id", requireAdmin, updateCouponSubmission);
router.patch("/:id/approve", requireAdmin, approveCouponSubmission);
router.patch("/:id/reject", requireAdmin, rejectCouponSubmission);

export default router;
