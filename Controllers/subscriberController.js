import Subscriber from "../Models/subscribeModel.js";
import nodemailer from "nodemailer";

const getTransporter = () => {
  const service = process.env.MAIL_SERVICE || "Gmail";
  const user = process.env.MAIL_USER || "";
  const pass = process.env.MAIL_PASS || "";

  if (user && pass) {
    return nodemailer.createTransport({
      service,
      auth: { user, pass },
    });
  }

  const host = process.env.SMTP_HOST || "";
  const port = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER || "";
  const smtpPass = process.env.SMTP_PASS || "";
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  if (host && smtpUser && smtpPass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  return null;
};

const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();
const isValidEmail = (value = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const subscribeUser = async (req, res) => {
  try {
    const email = normalizeEmail(req?.body?.email);

    // 1. Validate
    if (!email || !isValidEmail(email)) {
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
    const fromAddress =
      process.env.MAIL_FROM || process.env.MAIL_USER || process.env.SMTP_USER || "";
    const transporter = getTransporter();

    let emailSent = false;
    const mailConfigured = Boolean(transporter && fromAddress);
    if (mailConfigured) {
      const mailOptions = {
        from: fromAddress,
        to: email,
        subject: "Thanks for Subscribing!",
        html: `<h2>Welcome to coupon heaven!</h2><p>Your wishlist will not be wishlist anymore with us, and the good news is, it's not going to cost you a fortune. With this subscription, you have opened the door to the premium world of coupons and vouchers.</p>`,
      };
      try {
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (mailErr) {
        console.error("Subscription Email Error:", mailErr?.message || mailErr);
      }
    }

    res
      .status(200)
      .json({ message: "Subscribed successfully", emailSent, mailConfigured });
  } catch (error) {
    console.error("Subscription Error:", error);

    // Handle duplicate subscription gracefully (unique index violation)
    if (error && (error.code === 11000 || error.code === 11001)) {
      return res.status(400).json({ message: "Already Subscribed" });
    }

    res.status(500).json({
      message: "Server Error",
      ...(process.env.NODE_ENV !== "production"
        ? { error: error?.message || String(error) }
        : {}),
    });
  }
};
