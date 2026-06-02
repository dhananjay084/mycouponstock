import User from "../Models/userModal.js";
import Subscriber from "../Models/subscribeModel.js";

export const getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("name email phone role authProvider socialProvider referralCode referredBy createdAt")
      .populate("referredBy", "name email referralCode")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch users." });
  }
};

export const getAdminSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find()
      .select("email createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(subscribers);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch subscribers." });
  }
};
