import express from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} from '../Controllers/viewController.js';
import { protect, authorizeRoles } from '../middleware/authmiddleware.js'; // Import your middleware


const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, authorizeRoles('admin'), createReview); // Only admin can create
router.put('/:id', protect, authorizeRoles('admin'), updateReview); 
router.delete('/:id', protect, authorizeRoles('admin'), deleteReview); // Only admin can delete

// router.post('/', createReview);
// router.put('/:id', updateReview);
// router.delete('/:id', deleteReview);

export default router;
