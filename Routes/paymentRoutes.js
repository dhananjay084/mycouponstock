import { Router } from 'express';
const router = Router();
import { createOrder, addBeneficiary, createPayout } from '../Controllers/paymentController.js';

router.post('/create-order', createOrder);
router.post('/add-beneficiary', addBeneficiary);
router.post('/create-payout', createPayout);

export default router;
