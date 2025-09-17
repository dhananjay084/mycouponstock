import Subscriber from "../Models/subscribeModel.js";
import nodemailer from "nodemailer";

// configure transporter (use your email service)
const transporter = nodemailer.createTransport({
  service: "Gmail", // or any SMTP service like SendGrid
  auth: {
    user: "abdullakhan@octaadsmedia.com",
    pass: "ylty mahh luql qvrt", // use App Password for Gmail
  },
});

export const subscribeUser = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Validate
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Valid email is required" });
    }

    // 2. Check if already subscribed
    const existing = await Subscriber.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Already Subscribed" });
    }

    // 3. Save subscriber
    const subscriber = new Subscriber({ email });
    await subscriber.save();

    // 4. Send confirmation email
    const mailOptions = {
      from: "abdullakhan@octaadsmedia.com",
      to: email,
      subject: "Thanks for Subscribing!",
      html: `<h2>Welcome to coupon heaven!</h2><p>Your wishlist will not be wishlist anymore with us, and the good news is, it's not going to cost you a fortune. With this subscription, you have opened the door to the premium world of coupons and vouchers.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Subscribed and email sent successfully" });
  } catch (error) {
    console.error("Subscription Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
