// Models/referralModel.js
import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      referralCode: { type: String, required: true },
      referralLink: { type: String, required: true },
      referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional
    },
    { timestamps: true }
  );
  

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;
