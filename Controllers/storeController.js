import Store from '../Models/storeModel.js';
import slugify from "slugify";

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function getStores(req, res) {
  try {
    const { country, countries } = req.query;
    let query = {};
    if (country) {
      query.country = country;
    } else if (countries) {
      const list = countries.split(',').map((c) => c.trim()).filter(Boolean);
      if (list.length > 0) query.country = { $in: list };
    }
    const stores = await Store.find(query);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    country,
    metaTitle,
metaDescription,
metaKeywords,
  } = req.body;

  if (!storeName || !storeDescription || !storeImage || !homePageTitle || !storeType || discountPercentage === undefined || !country) {
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
      country,
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
    const { country, countries } = req.query;
  
    if (!searchTerm) {
      return res.status(400).json({ message: 'Search term  is required' });
    }
  
    try {
      const normalized = searchTerm.replace(/\s+/g, " ");
      const terms = normalized.split(" ").map((term) => term.trim()).filter(Boolean);
      const phraseRegex = new RegExp(escapeRegex(normalized), "i");
      const startsWithRegex = new RegExp("^" + escapeRegex(normalized), "i");

      let countryFilter = {};
      if (country) {
        countryFilter = { country };
      } else if (countries) {
        const list = countries.split(',').map((c) => c.trim()).filter(Boolean);
        if (list.length > 0) countryFilter = { country: { $in: list } };
      }

      const tokenConditions = terms.flatMap((term) => {
        const tokenRegex = new RegExp(escapeRegex(term), "i");
        return [
          { storeName: tokenRegex },
          { homePageTitle: tokenRegex },
          { storeDescription: tokenRegex },
        ];
      });

      const candidates = await Store.find({
        ...countryFilter,
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
      const store = await Store.findOne({ slug: req.params.slug });
  
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }
  
      res.json(store);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
  
  
  
