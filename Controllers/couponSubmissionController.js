import CouponSubmission from "../Models/couponSubmissionModel.js";
import Deal from "../Models/dealModel.js";
import slugify from "slugify";

async function generateUniqueSlug(title) {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  let slug = baseSlug;
  let counter = 1;
  const maxAttempts = 10;

  while (counter <= maxAttempts) {
    const existingDeal = await Deal.findOne({ slug });
    if (!existingDeal) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  if (counter > maxAttempts) {
    return `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  }

  return slug;
}

export async function createCouponSubmission(req, res) {
  try {
    const submission = await CouponSubmission.create(req.body);
    return res.status(201).json({ success: true, data: submission });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
}

export async function getCouponSubmissions(req, res) {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const data = await CouponSubmission.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function approveCouponSubmission(req, res) {
  try {
    const { id } = req.params;
    const submission = await CouponSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, error: "Submission not found" });
    }

    if (submission.status === "approved") {
      return res.status(400).json({ success: false, error: "Submission already approved" });
    }
    if (!submission.homePageTitle || !submission.dealType || !submission.details || !submission.redirectionLink) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields. Please complete Headline Offer, Deal Type, Details, and Redirection Link before approving.",
      });
    }

    const slug = await generateUniqueSlug(submission.dealTitle);

    const newDeal = await Deal.create({
      dealTitle: submission.dealTitle,
      slug,
      dealDescription: submission.dealDescription,
      dealImage: submission.dealImage,
      homePageTitle: submission.homePageTitle,
      showOnHomepage: submission.showOnHomepage || false,
      dealType: submission.dealType,
      dealCategory: submission.dealCategory,
      details: submission.details,
      categorySelect: submission.categorySelect,
      couponCode: submission.couponCode,
      discount: submission.discount,
      store: submission.store,
      expiredDate: submission.expiredDate,
      redirectionLink: submission.redirectionLink,
      country: submission.country,
      metaTitle: submission.metaTitle,
      metaDescription: submission.metaDescription,
      metaKeywords: submission.metaKeywords,
    });

    submission.status = "approved";
    submission.approvedDealId = newDeal._id;
    await submission.save();

    return res.status(200).json({ success: true, data: submission });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function rejectCouponSubmission(req, res) {
  try {
    const { id } = req.params;
    const submission = await CouponSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, error: "Submission not found" });
    }

    submission.status = "rejected";
    await submission.save();

    return res.status(200).json({ success: true, data: submission });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateCouponSubmission(req, res) {
  try {
    const { id } = req.params;
    const submission = await CouponSubmission.findById(id);
    if (!submission) {
      return res.status(404).json({ success: false, error: "Submission not found" });
    }
    if (submission.status === "approved") {
      return res.status(400).json({ success: false, error: "Approved submissions cannot be edited" });
    }

    const allowedFields = [
      "dealTitle",
      "dealDescription",
      "dealImage",
      "homePageTitle",
      "dealType",
      "dealCategory",
      "details",
      "categorySelect",
      "couponCode",
      "discount",
      "expiredDate",
      "store",
      "country",
      "redirectionLink",
      "metaTitle",
      "metaDescription",
      "metaKeywords",
      "showOnHomepage",
    ];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        submission[field] = req.body[field];
      }
    });

    await submission.save();
    return res.status(200).json({ success: true, data: submission });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
