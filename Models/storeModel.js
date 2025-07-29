import { Schema, model } from 'mongoose';

const storeSchema = new Schema({
  storeName: {
    type: String,
    required: true,
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
    type: String, // dynamic values allowed
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
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

export default model('Store', storeSchema);
