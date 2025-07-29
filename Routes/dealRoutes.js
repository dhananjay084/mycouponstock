import { Router } from 'express';
const router = Router();
import {
  getDeals,
  getDealById,
  createDeal,
  deleteDeal,
  updateDeal
} from '../Controllers/dealController.js';

router.get('/', getDeals);
router.get('/:id', getDealById); // 🔥 new route
router.post('/', createDeal);
router.delete('/:id', deleteDeal);
router.patch('/:id', updateDeal);

export default router;
