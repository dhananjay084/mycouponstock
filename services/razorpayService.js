import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export function Order(amount, currency = 'INR') {
  const options = {
    amount: amount * 100, // in paise
    currency,
    payment_capture: 1,
  };
  return razorpay.orders.create(options);
}

export function Beneficiary(beneficiaryData) {
  return razorpay.payouts.createBeneficiary(beneficiaryData);
}

export function Payout(payoutData) {
  // payoutData includes account_number, amount, mode, purpose etc.
  payoutData.amount = payoutData.amount * 100; // convert to paise
  return razorpay.payouts.create(payoutData);
}
