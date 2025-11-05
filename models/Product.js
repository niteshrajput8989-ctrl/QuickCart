import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  userId: { type: String, required: true, ref: "User" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number, required: true },
  image: { type: [String], required: true }, // ✅ changed "images" → "image"
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  modelGlb: { type: String },
  modelUsdz: { type: String },
  modelPoster: { type: String },
});

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;
