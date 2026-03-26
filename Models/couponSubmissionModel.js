import { Schema, model } from "mongoose";

const couponSubmissionSchema = new Schema(
  {
    dealTitle: { type: String, required: true },
    dealDescription: { type: String, required: true },
    dealImage: { type: String, required: true },
    homePageTitle: { type: String },
    showOnHomepage: { type: Boolean, default: false },
    dealType: { type: String },
    dealCategory: { type: String, enum: ["coupon", "deal"], required: true },
    details: { type: String },
    categorySelect: { type: String, required: true },
    couponCode: { type: String, required: true },
    discount: { type: String, required: true },
    expiredDate: { type: Date, required: true },
    store: { type: String, required: true },
    country: { type: [String], required: true },
    redirectionLink: { type: String },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },

    submitterName: { type: String, required: true },
    submitterEmail: { type: String, required: true },
    submitterPhone: { type: String, required: true },

    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    approvedDealId: { type: Schema.Types.ObjectId, ref: "Deal" },
  },
  { timestamps: true }
);

export default model("CouponSubmission", couponSubmissionSchema);
