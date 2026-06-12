import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  popularStore: {
    type: Boolean,
    default: false,
  },
  metaTitle: {
    type: String,
    default: "",
  },

  metaDescription: {
    type: String,
    default: "",
  },

  metaKeywords: {
    type: String,
    default: "",
  },
  pageHeading: {
    type: String,
    default: "",
  },
  pageDescription: {
    type: String,
    default: "",
  },
  showOnHomepage: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

categorySchema.index({ name: 1 });

export default model('Category', categorySchema);
