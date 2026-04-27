import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    country_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

countrySchema.index({ country_name: 1 });

const Country = mongoose.model("Country", countrySchema);
export default Country;
