import express from "express";
import { createContact, getAllContacts } from "../Controllers/contactController.js";
import { requireAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

// POST /api/contacts
router.post("/", createContact);

// GET /api/contacts
router.get("/", requireAdmin, getAllContacts);

export default router;
