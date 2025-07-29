// models/Blog.js
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    default: '',
  },
  heading: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  showOnHome: {
    type: Boolean,
    default: false,
  },
  featuredPost: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.model('Blog', blogSchema);
