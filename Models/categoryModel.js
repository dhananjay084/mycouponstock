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
  showOnHomepage: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

export default model('Category', categorySchema);
