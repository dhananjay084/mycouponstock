import Blog from "../Models/blogModel.js";
import mongoose from 'mongoose'; // Import mongoose to use isValidObjectId

// CREATE
export const createBlog = async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// READ ALL
export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// READ SINGLE
export const getBlogById = async (req, res) => {
  // NEW: Validate if the ID is a valid MongoDB ObjectId before querying
  if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid or missing Blog ID' });
  }

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    // This catch block will now primarily handle database connection issues or other unexpected errors
    console.error('Error fetching blog by ID:', err);
    res.status(500).json({ error: err.message });
  }
};

// UPDATE
export const updateBlog = async (req, res) => {
  // NEW: Validate if the ID is a valid MongoDB ObjectId before querying
  if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid or missing Blog ID' });
  }

  try {
    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return res.status(404).json({ error: "Blog not found" });
    res.json(updated);
  } catch (err) {
    console.error('Error updating blog:', err); // Added console.error for better debugging
    res.status(400).json({ error: err.message });
  }
};

// DELETE
export const deleteBlog = async (req, res) => {
  // NEW: Validate if the ID is a valid MongoDB ObjectId before querying
  if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid or missing Blog ID' });
  }

  try {
    const deleted = await Blog.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Blog not found" });
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error('Error deleting blog:', err); // Added console.error for better debugging
    res.status(500).json({ error: err.message });
  }
};
