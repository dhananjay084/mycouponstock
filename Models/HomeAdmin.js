import { Schema, model } from 'mongoose';

const faqSchema = new Schema({
  question: {
    type: String,
    required: [true, 'FAQ question is required'],
  },
  answer: {
    type: String,
    required: [true, 'FAQ answer is required'],
  },
});

const HomeAdminSchema = new Schema({
  bannerDeals: {
    type: [Schema.Types.ObjectId],
    ref: 'Deal',
    validate: {
      validator: (arr) => arr.length === 3,
      message: 'Exactly 3 deals must be selected.',
    },
    required: true,
  },
  homepageBanner: {
    type: String,
    required: true,
  },
  midHomepageBanner: {
    type: String,
    required: true,
  },
  allCouponsPageBanner: {
    type: String,
    required: true,
  },
  allCouponsAboutHeading: {
    type: String,
    required: true,
  },
  allCouponsAboutDescription: {
    type: String,
    required: true,
  },
  allStoresPageBanner: {
    type: String,
    required: true,
  },
  allStoresAboutHeading: {
    type: String,
    required: true,
  },
  allStoresAboutDescription: {
    type: String,
    required: true,
  },
  allCategoriesPageBanner: {
    type: String,
    required: true,
  },
  allCategoriesAboutHeading: {
    type: String,
    required: true,
  },
  allCategoriesAboutDescription: {
    type: String,
    required: true,
  },
  individualStoreBanner: {
    type: String,
    required: true,
  },
  faqs: {
    type: [faqSchema],
    required: true,
  },
}, { timestamps: true });

export default model('HomeAdmin', HomeAdminSchema);
