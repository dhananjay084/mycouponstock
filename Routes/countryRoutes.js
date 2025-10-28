import express from "express";
import { addCountry, deleteCountry, getAllCountries } from "../Controllers/countryController.js";

const router = express.Router();

// Add country
router.post("/", addCountry);

// Get all countries
router.get("/", getAllCountries);

// Delete country
router.delete("/:id", deleteCountry);

export default router;
