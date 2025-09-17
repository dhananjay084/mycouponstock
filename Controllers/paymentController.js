import { Order, Beneficiary, Payout } from '../services/razorpayService.js';

export async function createOrder(req, res) {
  try {
    const { amount, currency } = req.body;
    const order = await Order(amount, currency);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function addBeneficiary(req, res) {
  try {
    const beneficiaryData = req.body;
    const beneficiary = await Beneficiary(beneficiaryData);
    res.json(beneficiary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function createPayout(req, res) {
  try {
    const payoutData = req.body;
    const payout = await Payout(payoutData);
    res.json(payout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
