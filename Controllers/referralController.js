// Controllers/referralController.js
import Referral from "../Models/referralModel.js";
import User from "../Models/userModal.js";

// ✅ Generate referral link
export const generateReferralLink = async (req, res) => {
    try {
      const userId = req.user?.id || req.cookies?.userId;
      if (!userId) return res.status(400).json({ message: "User ID not found" });
  
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const baseUrl = process.env.CLIENT_URL || "https://mycouponstock.com";
      const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;
  
      await Referral.findOneAndUpdate(
        { userId },
        { referralCode: user.referralCode, referralLink },
        { upsert: true, new: true }
      );
  
      res.status(200).json({ success: true, referralLink });
    } catch (err) {
      console.error("Error generating referral link:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  

// ✅ Register user with referral
export const registerWithReferral = async (req, res) => {
    try {
      const { name, email, password, referralCode } = req.body;
  
      let referredBy = null;
      let referrer = null;
      if (referralCode && referralCode !== "null") {
        referrer = await User.findOne({ referralCode });
        if (referrer) referredBy = referrer._id;
      }
  
      const newUser = new User({
        name,
        email,
        password,
        referredBy,
      });
  
      await newUser.save();
  
      // Save referral tracking
      if (referredBy) {
        await Referral.create({
          userId: referredBy,
          referralCode: referrer.referralCode,
          referralLink: `${process.env.CLIENT_URL}/signup?ref=${referrer.referralCode}`,
          referredUserId: newUser._id,
        });
      }
  
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        referredBy,
      });
    } catch (err) {
      console.error("Referral registration error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

// ✅ Get users referred by current user
export const getMyReferrals = async (req, res) => {
    try {
      const userId = req.user?.id || req.cookies?.userId;
      if (!userId) return res.status(400).json({ message: "User ID not found" });
  
      const referrals = await User.find({ referredBy: userId }).select("name email createdAt");
      res.status(200).json({ success: true, referrals });
    } catch (err) {
      console.error("Fetch referrals error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
