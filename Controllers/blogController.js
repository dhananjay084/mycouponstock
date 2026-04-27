import Blog from "../Models/blogModel.js";
import mongoose from 'mongoose'; // Import mongoose to use isValidObjectId
import { sharedCache } from "../utils/simpleCache.js";

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
    const blogs = await Blog.find().lean();
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBlogSitemap = async (req, res) => {
  try {
    const maxLimit = Number.parseInt(process.env.SITEMAP_MAX_ITEMS || "50000", 10);
    let requested = Number.parseInt(req.query.limit || String(maxLimit), 10);
    if (Number.isNaN(requested) || requested <= 0) requested = maxLimit;
    requested = Math.min(requested, maxLimit);

    const cacheTtlMs = Number.parseInt(process.env.SITEMAP_CACHE_MS || "3600000", 10);
    const cacheKey = `sitemap:blogs:${requested}`;
    const cached = sharedCache.get(cacheKey);
    if (cached) {
      res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(cached);
    }

    const blogs = await Blog.find()
      .select("heading updatedAt createdAt")
      .limit(requested)
      .lean();

    sharedCache.set(cacheKey, blogs, Number.isFinite(cacheTtlMs) ? cacheTtlMs : 3600000);
    res.set("Cache-Control", "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(blogs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
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
