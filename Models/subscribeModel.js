import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["subscribed", "unsubscribed"],
    default: "subscribed",
    trim: true,
  },
}, { timestamps: true });

export default mongoose.model("Subscriber", subscriberSchema);
