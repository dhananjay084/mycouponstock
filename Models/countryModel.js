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

const Country = mongoose.model("Country", countrySchema);
export default Country;
