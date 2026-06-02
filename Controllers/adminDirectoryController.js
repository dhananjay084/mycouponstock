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
      .select("email status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(subscribers);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to fetch subscribers." });
  }
};

export const deleteAdminSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);

    if (!deletedSubscriber) {
      return res.status(404).json({ message: "Subscriber not found." });
    }

    return res.status(200).json({ message: "Subscriber deleted successfully." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete subscriber." });
  }
};
