import Country from "../Models/countryModel.js";

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
    const countries = await Country.find().sort({ country_name: 1 });
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
