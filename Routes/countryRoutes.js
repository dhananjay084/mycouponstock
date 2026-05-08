import express from "express";
import { addCountry, deleteCountry, getAllCountries, getCountrySitemap } from "../Controllers/countryController.js";
import { requireAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

// Add country
router.post("/", requireAdmin, addCountry);

// Get all countries
router.get("/sitemap", getCountrySitemap);
router.get("/", getAllCountries);

// Delete country
router.delete("/:id", requireAdmin, deleteCountry);

export default router;
