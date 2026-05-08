import { Router } from 'express';
const router = Router();
import { createOrder, addBeneficiary, createPayout } from '../Controllers/paymentController.js';
import { requireAdmin } from '../middleware/authmiddleware.js';

router.post('/create-order', requireAdmin, createOrder);
router.post('/add-beneficiary', requireAdmin, addBeneficiary);
router.post('/create-payout', requireAdmin, createPayout);

export default router;
