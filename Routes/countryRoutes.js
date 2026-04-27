import express from "express";
import { addCountry, deleteCountry, getAllCountries, getCountrySitemap } from "../Controllers/countryController.js";
import { protect, authorizeRoles } from "../middleware/authmiddleware.js";

const router = express.Router();

// Add country
router.post("/", protect, authorizeRoles("admin"), addCountry);

// Get all countries
router.get("/sitemap", getCountrySitemap);
router.get("/", getAllCountries);

// Delete country
router.delete("/:id", protect, authorizeRoles("admin"), deleteCountry);

export default router;
