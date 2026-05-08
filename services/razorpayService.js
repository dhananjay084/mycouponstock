import Razorpay from 'razorpay';

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay is not configured. Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export function Order(amount, currency = 'INR') {
  const razorpay = getRazorpayClient();
  const options = {
    amount: amount * 100, // in paise
    currency,
    payment_capture: 1,
  };
  return razorpay.orders.create(options);
}

export function Beneficiary(beneficiaryData) {
  const razorpay = getRazorpayClient();
  return razorpay.payouts.createBeneficiary(beneficiaryData);
}

export function Payout(payoutData) {
  const razorpay = getRazorpayClient();
  // payoutData includes account_number, amount, mode, purpose etc.
  payoutData.amount = payoutData.amount * 100; // convert to paise
  return razorpay.payouts.create(payoutData);
}
