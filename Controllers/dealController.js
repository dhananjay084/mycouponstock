import Deal from '../Models/dealModel.js';
import slugify from 'slugify';
import { sharedCache } from "../utils/simpleCache.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildCountryQuery = (country, countries) => {
  if (country) return { country };
  if (countries) {
    const list = String(countries)
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (list.length > 0) return { country: { $in: list } };
  }
  return {};
};

const parseBooleanQuery = (value) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

export async function getDeals(req, res) {
  try {
    const {
      country,
      countries,
      store,
      categorySelect,
      dealCategory,
      dealType,
      showOnHomepage,
      excludeId,
      limit,
      countOnly,
    } = req.query;
    const query = buildCountryQuery(country, countries);

    if (store) {
      const normalizedStore = String(store).trim();
      query.store = new RegExp(`^${escapeRegex(normalizedStore)}$`, "i");
    }
    if (categorySelect) {
      query.categorySelect = String(categorySelect).trim();
    }
    if (dealCategory) {
      query.dealCategory = String(dealCategory).trim();
    }
    if (dealType) {
      query.dealType = String(dealType).trim();
    }

    const showOnHomepageValue = parseBooleanQuery(showOnHomepage);
    if (typeof showOnHomepageValue === "boolean") {
      query.showOnHomepage = showOnHomepageValue;
    }

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const countOnlyValue = parseBooleanQuery(countOnly);
    if (countOnlyValue === true) {
      const count = await Deal.countDocuments(query);
      return res.json({ count });
    }

    let request = Deal.find(query).sort({ updatedAt: -1, createdAt: -1 });
    const parsedLimit = Number.parseInt(limit, 10);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      request = request.limit(parsedLimit);
    }

    const deals = await request.lean();
    res.json(deals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getDealSitemap(req, res) {
  try {
    const { country, countries, limit } = req.query;
    const query = buildCountryQuery(country, countries);

    const cacheTtlMs = Number.parseInt(process.env.SITEMAP_CACHE_MS || "3600000", 10);
    const cacheKey = `sitemap:deals:${JSON.stringify({ query, limit: limit || "" })}`;
    const cached = sharedCache.get(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(cached);
    }

    const maxLimit = Number.parseInt(process.env.SITEMAP_MAX_ITEMS || "50000", 10);
    let requested = Number.parseInt(limit || String(maxLimit), 10);
    if (Number.isNaN(requested) || requested <= 0) requested = maxLimit;
    requested = Math.min(requested, maxLimit);

    const deals = await Deal.find(query)
      .select("slug country updatedAt createdAt")
      .limit(requested)
      .lean();

    sharedCache.set(cacheKey, deals, Number.isFinite(cacheTtlMs) ? cacheTtlMs : 3600000);
    res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(deals);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
async function generateUniqueSlug(title) {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
  
  let slug = baseSlug;
  let counter = 1;
  const maxAttempts = 10;
  
  // Check if slug exists and make it unique
  while (counter <= maxAttempts) {
    const existingDeal = await Deal.findOne({ slug });
    if (!existingDeal) {
      break;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  if (counter > maxAttempts) {
    const fallback = `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    return fallback;
  }
  
  return slug;
}

const normalizeCountry = (val) => {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === "string") {
    return val
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
  }
  return [];
};

const validateDealPayload = (payload = {}) => {
  const {
    dealTitle,
    dealDescription,
    dealImage,
    homePageTitle,
    dealType,
    dealCategory,
    details,
    categorySelect,
    couponCode,
    discount,
    store,
    expiredDate,
    redirectionLink,
    country,
    layoutFormat,
  } = payload;

  const normalizedLayout = layoutFormat === "structured" ? "structured" : "custom";
  const normalizedCountry = normalizeCountry(country);

  const missingFields = [];
  const isEmpty = (val) =>
    val === undefined ||
    val === null ||
    (typeof val === "string" && val.trim() === "") ||
    (Array.isArray(val) && val.length === 0);

  if (isEmpty(dealTitle)) missingFields.push("dealTitle");
  if (isEmpty(dealDescription)) missingFields.push("dealDescription");
  if (isEmpty(dealImage)) missingFields.push("dealImage");
  if (isEmpty(homePageTitle)) missingFields.push("homePageTitle");
  if (isEmpty(dealType)) missingFields.push("dealType");
  if (isEmpty(dealCategory)) missingFields.push("dealCategory");
  if (normalizedLayout !== "structured" && isEmpty(details)) missingFields.push("details");
  if (isEmpty(categorySelect)) missingFields.push("categorySelect");
  if (isEmpty(store)) missingFields.push("store");
  if (isEmpty(couponCode)) missingFields.push("couponCode");
  if (isEmpty(discount)) missingFields.push("discount");
  if (isEmpty(expiredDate)) missingFields.push("expiredDate");
  if (isEmpty(redirectionLink)) missingFields.push("redirectionLink");
  if (isEmpty(normalizedCountry)) missingFields.push("country");

  return { missingFields, normalizedLayout, normalizedCountry };
};
export async function createDeal(req, res) {
  const {
    dealTitle,
    dealDescription,
    dealImage,
    homePageTitle,
    showOnHomepage,
    dealType,
    dealCategory,
    details,
    layoutFormat,
    descriptionImage,
    tagPrimary,
    tagSecondary,
    headline,
    usedTodayText,
    successRateText,
    endingSoonText,
    userTypeText,
    discount,
    categorySelect,
    couponCode,
    store,
    expiredDate,
    redirectionLink,
    country, // ✅ ADD THIS
    metaTitle,
    metaDescription,
    metaKeywords
  } = req.body;

  const { missingFields, normalizedLayout, normalizedCountry } = validateDealPayload(req.body);

  if (missingFields.length > 0) {
    return res.status(400).json({
      message: "All required fields must be filled",
      missingFields,
    });
  }

  try {
    const slug = await generateUniqueSlug(dealTitle);

    const newDeal = new Deal({
      dealTitle,
      slug,
      dealDescription,
      dealImage,
      homePageTitle,
      showOnHomepage: showOnHomepage || false,
      dealType,
      dealCategory,
      details,
      layoutFormat: normalizedLayout,
      descriptionImage,
      tagPrimary,
      tagSecondary,
      headline,
      usedTodayText,
      successRateText,
      endingSoonText,
      userTypeText,
      categorySelect,
      couponCode,
      discount,
      store,
      expiredDate,
      redirectionLink,
      country: normalizedCountry, // ✅ ADD THIS WHEN SAVING
      metaTitle,
      metaDescription,
      metaKeywords
    });

    const savedDeal = await newDeal.save();
    res.status(201).json(savedDeal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function bulkCreateDeals(req, res) {
  try {
    const { deals } = req.body || {};
    if (!Array.isArray(deals) || deals.length === 0) {
      return res.status(400).json({ success: false, message: "Deals array is required." });
    }

    const errors = [];
    const saved = [];
    const slugSet = new Set();

    for (let i = 0; i < deals.length; i++) {
      const payload = deals[i] || {};
      const { missingFields, normalizedLayout, normalizedCountry } = validateDealPayload(payload);

      if (missingFields.length > 0) {
        errors.push({ index: i, missingFields, message: "Missing required fields" });
        continue;
      }

      const baseSlug = await generateUniqueSlug(payload.dealTitle);
      let uniqueSlug = baseSlug;
      let suffix = 1;
      while (slugSet.has(uniqueSlug)) {
        uniqueSlug = `${baseSlug}-${suffix}`;
        suffix += 1;
      }
      slugSet.add(uniqueSlug);

      try {
        const newDeal = new Deal({
          ...payload,
          slug: uniqueSlug,
          layoutFormat: normalizedLayout,
          country: normalizedCountry,
          showOnHomepage: payload.showOnHomepage || false,
        });
        const savedDeal = await newDeal.save();
        saved.push(savedDeal);
      } catch (err) {
        errors.push({ index: i, message: err.message || "Failed to save deal" });
      }
    }

    return res.status(200).json({
      success: true,
      insertedCount: saved.length,
      failedCount: errors.length,
      errors,
      data: saved,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

  
  
  export async function getDealById(req, res) {
    try {
      const deal = await Deal.findById(req.params.id);
      if (!deal) return res.status(404).json({ message: 'Deal not found' });
      res.json(deal);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
export async function deleteDeal(req, res) {
  try {
    const deleted = await Deal.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Deal not found' });
    res.json({ message: 'Deal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateDeal(req, res) {
  try {
    if (req.body.dealTitle) {
      req.body.slug = await generateUniqueSlug(req.body.dealTitle);
    }
    const updated = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Deal not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export async function getDealBySlug(req, res) {
  try {
    const deal = await Deal.findOne({ slug: req.params.slug }).lean();
    if (!deal) return res.status(404).json({ message: 'Deal not found' });
    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function searchDeals(req, res) {
    const searchTerm = req.query.q;
    const { country, countries } = req.query;
  
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term (q) is required' });
    }
  
    try {
      // Create case-insensitive regex for "starts with"
      const startsWithRegex = new RegExp('^' + searchTerm, 'i');
      // Create case-insensitive regex for "contains"
      const containsRegex = new RegExp(searchTerm, 'i');
      let countryFilter = {};
      if (country) {
        countryFilter = { country };
      } else if (countries) {
        const list = countries.split(',').map((c) => c.trim()).filter(Boolean);
        if (list.length > 0) countryFilter = { country: { $in: list } };
      }
  
      // 1. Find deals where dealTitle starts with the searchTerm
      const startsWithDeals = await Deal.find({ ...countryFilter, dealTitle: startsWithRegex }).lean(); // .lean() for plain JS objects
  
      // Get IDs of deals found in "starts with" to exclude them from "contains" search
      const startsWithIds = startsWithDeals.map(deal => deal._id);
  
      // 2. Find deals where dealTitle contains the searchTerm, excluding those already found
      const containsDeals = await Deal.find({
        ...countryFilter,
        dealTitle: containsRegex,
        _id: { $nin: startsWithIds } // Exclude deals already found
      }).lean();
  
      // Combine results: startsWithDeals first, then containsDeals
      const combinedDeals = [...startsWithDeals, ...containsDeals];
  
      res.json(combinedDeals);
    } catch (err) {
      console.error('Error during deal search:', err);
      res.status(500).json({ message: err.message });
    }
  }
