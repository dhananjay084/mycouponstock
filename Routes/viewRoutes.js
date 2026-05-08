import express from 'express';
import {
  getReviews,
  createReview,
  updateReview,
  deleteReview
} from '../Controllers/viewController.js';
import { requireAdmin } from '../middleware/authmiddleware.js'; // Import your middleware


const router = express.Router();

router.get('/', getReviews);
router.post('/', requireAdmin, createReview); // Only admin can create
router.put('/:id', requireAdmin, updateReview); 
router.delete('/:id', requireAdmin, deleteReview); // Only admin can delete

// router.post('/', createReview);
// router.put('/:id', updateReview);
// router.delete('/:id', deleteReview);

export default router;
