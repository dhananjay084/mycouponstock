import express from 'express'; // Import express
const router = express.Router(); // Use express.Router()
import { protect, authorizeRoles } from '../middleware/authmiddleware.js'; // Import your middleware

import {
  createBlog,
  getAllBlogs, // Using getAllBlogs as per your provided code
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../Controllers/blogController.js'; // Adjust path if necessary

// --- Public Routes ---
// GET all blogs
router.get('/', getAllBlogs);
// GET a single blog by ID
router.get('/:id', getBlogById);

// --- Protected Routes (Admin Only) ---
// POST a new blog (requires admin role)
router.post('/', protect, authorizeRoles('admin'), createBlog);
// UPDATE a blog by ID (requires admin role)
router.put('/:id', protect, authorizeRoles('admin'), updateBlog);
// DELETE a blog by ID (requires admin role)
router.delete('/:id', protect, authorizeRoles('admin'), deleteBlog);

export default router;
