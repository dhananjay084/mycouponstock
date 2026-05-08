import express from 'express'; // Import express
const router = express.Router(); // Use express.Router()
import { requireAdmin } from '../middleware/authmiddleware.js'; // Import your middleware

import {
  createBlog,
  getAllBlogs, // Using getAllBlogs as per your provided code
  getBlogSitemap,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../Controllers/blogController.js'; // Adjust path if necessary

// --- Public Routes ---
// GET all blogs
router.get('/sitemap', getBlogSitemap);
router.get('/', getAllBlogs);
// GET a single blog by ID
router.get('/:id', getBlogById);

// --- Protected Routes (Admin Only) ---
// POST a new blog (requires admin role)
router.post('/', requireAdmin, createBlog);
// UPDATE a blog by ID (requires admin role)
router.put('/:id', requireAdmin, updateBlog);
// DELETE a blog by ID (requires admin role)
router.delete('/:id', requireAdmin, deleteBlog);

export default router;
