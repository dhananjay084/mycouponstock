import Store from '../Models/storeModel.js';
import slugify from "slugify";
import { sharedCache } from "../utils/simpleCache.js";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildCountryQuery = () => ({});

const parseBooleanQuery = (value) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return undefined;
};

export async function getStores(req, res) {
  try {
    const { popularStore, storeType, showOnHomepage, limit, countOnly } = req.query;
    const query = buildCountryQuery();

    if (storeType) {
      query.storeType = String(storeType).trim();
    }

    const popularStoreValue = parseBooleanQuery(popularStore);
    if (typeof popularStoreValue === "boolean") {
      query.popularStore = popularStoreValue;
    }

    const showOnHomepageValue = parseBooleanQuery(showOnHomepage);
    if (typeof showOnHomepageValue === "boolean") {
      query.showOnHomepage = showOnHomepageValue;
    }

    const countOnlyValue = parseBooleanQuery(countOnly);
    if (countOnlyValue === true) {
      const count = await Store.countDocuments(query);
      return res.json({ count });
    }

    let request = Store.find(query).sort({ updatedAt: -1, createdAt: -1 });
    const parsedLimit = Number.parseInt(limit, 10);
    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      request = request.limit(parsedLimit);
    }

    const stores = await request.lean();
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getStoreSitemap(req, res) {
  try {
    const { limit } = req.query;
    const query = buildCountryQuery();

    const cacheTtlMs = Number.parseInt(process.env.SITEMAP_CACHE_MS || "3600000", 10);
    const cacheKey = `sitemap:stores:${JSON.stringify({ query, limit: limit || "" })}`;
    const cached = sharedCache.get(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(cached);
    }

    const maxLimit = Number.parseInt(process.env.SITEMAP_MAX_ITEMS || "50000", 10);
    let requested = Number.parseInt(limit || String(maxLimit), 10);
    if (Number.isNaN(requested) || requested <= 0) requested = maxLimit;
    requested = Math.min(requested, maxLimit);

    const stores = await Store.find(query)
      .select("slug country updatedAt createdAt")
      .limit(requested)
      .lean();

    sharedCache.set(cacheKey, stores, Number.isFinite(cacheTtlMs) ? cacheTtlMs : 3600000);
    res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(stores);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function createStore(req, res) {
  const {
    storeName,
    storeDescription,
    storeImage,
    homePageTitle,  
    showOnHomepage,
    storeType,
    discountPercentage,
    popularStore,
    storeHtmlContent,
    metaTitle,
metaDescription,
metaKeywords,
  } = req.body;

  if (!storeName || !storeDescription || !storeImage || !homePageTitle || !storeType || discountPercentage === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const slug = slugify(storeName, {
      lower: true,
      strict: true,
    });

    const existingSlug = await Store.findOne({ slug });
    if (existingSlug) {
      return res.status(400).json({ message: "Store with this name already exists" });
    }

    const newStore = new Store({
      storeName,
      slug,
      storeDescription,
      storeImage,
      homePageTitle,
      showOnHomepage,
      storeType,
      discountPercentage,
      popularStore,
      storeHtmlContent,
      country: Array.isArray(req.body.country) ? req.body.country.filter(Boolean) : [],
      metaTitle,
metaDescription,
metaKeywords,
    });

    const saved = await newStore.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export async function updateStore(req, res) {
  try {
    if (req.body.storeName) {
      const slug = slugify(req.body.storeName, {
        lower: true,
        strict: true,
      });

      const existing = await Store.findOne({
        slug,
        _id: { $ne: req.params.id }
      });

      if (existing) {
        return res.status(400).json({ message: "Store slug already exists" });
      }

      req.body.slug = slug;
    }

    const updated = await Store.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: 'Store not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}



export async function deleteStore(req, res) {
  try {
    const deleted = await Store.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
export async function getStoreById(req, res) {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ message: 'Store not found' });
      res.json(store);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
  export async function searchStores(req, res) {
    const searchTerm = String(req.query.q || "").trim();
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term  is required' });
    }
  
    try {
      const normalized = searchTerm.replace(/\s+/g, " ");
      const terms = normalized.split(" ").map((term) => term.trim()).filter(Boolean);
      const phraseRegex = new RegExp(escapeRegex(normalized), "i");
      const startsWithRegex = new RegExp("^" + escapeRegex(normalized), "i");

      const tokenConditions = terms.flatMap((term) => {
        const tokenRegex = new RegExp(escapeRegex(term), "i");
        return [
          { storeName: tokenRegex },
          { homePageTitle: tokenRegex },
          { storeDescription: tokenRegex },
        ];
      });

      const candidates = await Store.find({
        $or: [{ storeName: phraseRegex }, ...tokenConditions],
      })
        .limit(80)
        .lean();

      const ranked = candidates
        .map((store) => {
          const name = String(store?.storeName || "");
          const title = String(store?.homePageTitle || "");
          const description = String(store?.storeDescription || "");
          let score = 0;

          if (startsWithRegex.test(name)) score += 120;
          if (phraseRegex.test(name)) score += 85;
          if (phraseRegex.test(title)) score += 35;

          let matchedTerms = 0;
          for (const term of terms) {
            const tokenRegex = new RegExp(escapeRegex(term), "i");
            const inName = tokenRegex.test(name);
            const inTitle = tokenRegex.test(title);
            const inDescription = tokenRegex.test(description);

            if (inName) score += 18;
            if (inTitle) score += 9;
            if (inDescription) score += 4;

            if (inName || inTitle || inDescription) matchedTerms += 1;
          }

          if (matchedTerms === terms.length) score += 30;

          return { store, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((item) => item.store);

      res.json(ranked);
    } catch (err) {
      console.error('Error during store search:', err);
      res.status(500).json({ message: err.message });
    }
  }
  export async function getStoreBySlug(req, res) {
    try {
      const store = await Store.findOne({ slug: req.params.slug }).lean();
  
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
  
      res.json(store);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
  
  
