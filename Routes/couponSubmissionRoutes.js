import { Router } from "express";
import {
  createCouponSubmission,
  getCouponSubmissions,
  approveCouponSubmission,
  rejectCouponSubmission,
} from "../Controllers/couponSubmissionController.js";
import { protect, authorizeRoles } from "../middleware/authmiddleware.js";

const router = Router();

router.post("/", createCouponSubmission);
router.get("/", protect, authorizeRoles("admin"), getCouponSubmissions);
router.patch("/:id/approve", protect, authorizeRoles("admin"), approveCouponSubmission);
router.patch("/:id/reject", protect, authorizeRoles("admin"), rejectCouponSubmission);

export default router;
