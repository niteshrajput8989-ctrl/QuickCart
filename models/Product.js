import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User", // Reference for seller or uploader
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    modelGlb: {
      type: String,
      default: "",
    },
    modelUsdz: {
      type: String,
      default: "",
    },
    modelPoster: {
      type: String,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent model overwrite error during hot reload
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
