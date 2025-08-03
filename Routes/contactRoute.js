import express from "express";
import { createContact, getAllContacts } from "../Controllers/contactController.js";

const router = express.Router();

// POST /api/contacts
router.post("/", createContact);

// GET /api/contacts
router.get("/", getAllContacts);

export default router;
