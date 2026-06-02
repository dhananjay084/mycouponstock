import express from "express";
import {
  createContact,
  getAllContacts,
  updateContactStatus,
} from "../Controllers/contactController.js";
import { requireAdmin } from "../middleware/authmiddleware.js";

const router = express.Router();

// POST /api/contacts
router.post("/", createContact);

// GET /api/contacts
router.get("/", requireAdmin, getAllContacts);

// PATCH /api/contacts/:id/status
router.patch("/:id/status", requireAdmin, updateContactStatus);

export default router;
