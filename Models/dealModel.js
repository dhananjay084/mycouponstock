import { Schema, model } from 'mongoose';

const dealSchema = new Schema({
  dealTitle: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  dealDescription: {
    type: String,
    required: true,
  },
  dealImage: {
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
  dealType: {
    type: String,
    required: true,
  },
  dealCategory: {
    type: String,
    enum: ['coupon', 'deal'],
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  categorySelect: {
    type: String,
    required: true,
  },
  couponCode: {
    type: String,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  expiredDate: {
    type: Date,
    required: true,
  },
  store: {
    type: String,
    required: true,
  },
  country: {
    type: [String], // can store multiple countries
    required: true,
  },
  redirectionLink: { type: String, required: true } 

}, 

{
  timestamps: true
});

export default model('Deal', dealSchema);
