import express from "express";
import { createContact, getAllContacts } from "../Controllers/contactController.js";
import { protect, authorizeRoles } from "../middleware/authmiddleware.js";

const router = express.Router();

// POST /api/contacts
router.post("/", createContact);

// GET /api/contacts
router.get("/", protect, authorizeRoles("admin"), getAllContacts);

export default router;
