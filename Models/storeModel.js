import { Schema, model } from 'mongoose';
import slugify from 'slugify';

const storeSchema = new Schema({
  storeName: {
    type: String,
    required: true,
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
  },

  storeDescription: {
    type: String,
    required: true,
  },
  storeImage: {
    type: String,
    required: true,
  },
  homePageTitle: {
    type: String,
    required: true,
  },
  showOnHomepage: {
    type: Boolean,
    default: false,
  },
  storeType: {
    type: String,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
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
  popularStore: {
    type: Boolean,
    default: false,
  },
  storeHtmlContent: {
    type: String,
    default: '',
  }
}, {
  timestamps: true,
});

storeSchema.pre('validate', function (next) {
  if (this.storeName && !this.slug) {
    this.slug = slugify(this.storeName, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
  next();
});

export default model('Store', storeSchema);
