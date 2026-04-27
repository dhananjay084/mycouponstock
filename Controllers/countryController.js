import Country from "../Models/countryModel.js";
import { sharedCache } from "../utils/simpleCache.js";

// ➕ Add a new country
export const addCountry = async (req, res) => {
  try {
    const { country_name } = req.body;

    if (!country_name || !country_name.trim()) {
      return res.status(400).json({ message: "Country name is required" });
    }

    const trimmed = country_name.trim();
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Country.findOne({
      country_name: new RegExp(`^${escaped}$`, "i"),
    });
    if (existing) {
      return res.status(409).json({ message: "Country already exists" });
    }

    const country = await Country.create({ country_name: trimmed });
    res.status(201).json({ message: "Country added successfully", country });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🗑 Delete a country by ID
export const deleteCountry = async (req, res) => {
  try {
    const { id } = req.params;
    const country = await Country.findByIdAndDelete(id);

    if (!country) {
      return res.status(404).json({ message: "Country not found" });
    }

    res.status(200).json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 📋 Get all countries
export const getAllCountries = async (req, res) => {
  try {
    const countries = await Country.find().sort({ country_name: 1 }).lean();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCountrySitemap = async (req, res) => {
  try {
    const maxLimit = Number.parseInt(process.env.SITEMAP_MAX_ITEMS || "50000", 10);
    let requested = Number.parseInt(req.query.limit || String(maxLimit), 10);
    if (Number.isNaN(requested) || requested <= 0) requested = maxLimit;
    requested = Math.min(requested, maxLimit);

    const cacheTtlMs = Number.parseInt(process.env.SITEMAP_CACHE_MS || "3600000", 10);
    const cacheKey = `sitemap:countries:${requested}`;
    const cached = sharedCache.get(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(cached);
    }

    const countries = await Country.find()
      .select("country_name updatedAt createdAt")
      .sort({ country_name: 1 })
      .limit(requested)
      .lean();

    sharedCache.set(cacheKey, countries, Number.isFinite(cacheTtlMs) ? cacheTtlMs : 3600000);
    res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(countries);
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
