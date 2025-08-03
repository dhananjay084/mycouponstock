import Contact from "../Models/contact.js";

export const createContact = async (req, res) => {
    try {
      const { firstName, lastName, email, phone, subject, message } = req.body;
  
      if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({
          success: false,
          error: "firstName, lastName, email and message are required",
        });
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: "Invalid email format",
        });
      }
  
      const contact = await Contact.create({
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
      });
  
      return res.status(201).json({ success: true, data: contact });
    } catch (err) {
      console.error("createContact error:", err); // full error in server logs
      return res.status(500).json({
        success: false,
        error: err.message || "Server error",
        stack: process.env.NODE_ENV !== "production" ? err.stack : undefined, // optional for dev
      });
    }
  };
  

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: contacts });
  } catch (err) {
    console.error("getAllContacts error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};
