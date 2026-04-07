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
  country: {
    type: String,
    required: true,
    index: true,
  },
  bannerDeals: {
    type: [Schema.Types.ObjectId],
    ref: 'Deal',
    validate: {
      validator: (arr) => arr.length >= 6,
      message: 'Select at least 6 deals.',
    },
    required: true,
  },
  dealPageBannerDeals: {
    type: [Schema.Types.ObjectId],
    ref: 'Deal',
    validate: {
      validator: (arr) => !arr || arr.length === 0 || arr.length >= 3,
      message: 'Select at least 3 deals for Deal page.',
    },
    default: [],
  },
  storePageBannerDeals: {
    type: [Schema.Types.ObjectId],
    ref: 'Deal',
    validate: {
      validator: (arr) => !arr || arr.length === 0 || arr.length >= 3,
      message: 'Select at least 3 deals for Store page.',
    },
    default: [],
  },
  categoryPageBannerDeals: {
    type: [Schema.Types.ObjectId],
    ref: 'Deal',
    validate: {
      validator: (arr) => !arr || arr.length === 0 || arr.length >= 3,
      message: 'Select at least 3 deals for Category page.',
    },
    default: [],
  },
  homepageBanner: {
    type: String,
    required: true,
  },
  midHomepageBanners: {
    type: [Schema.Types.Mixed],
    validate: {
      validator: (arr) =>
        Array.isArray(arr) &&
        arr.length >= 3 &&
        arr.every(
          (item) =>
            typeof item === 'string' ||
            (item &&
              typeof item === 'object' &&
              typeof item.image === 'string' &&
              item.image.trim().length > 0)
        ),
      message: 'Add at least 3 mid homepage banners with valid image URLs.',
    },
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
  faqImage: {
    type: String,
    default: "",
  },
  faqs: {
    type: [faqSchema],
    required: true,
  },
  homeFooterTitle: {
    type: String,
    default: "",
  },
  homeFooterDescription: {
    type: String,
    default: "",
  },
  homeMetaTitle: {
    type: String,
    default: "",
  },
  homeMetaDescription: {
    type: String,
    default: "",
  },
}, { timestamps: true });

export default model('HomeAdmin', HomeAdminSchema);
