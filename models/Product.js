import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  mainImage: { type: String, required: true },
  hoverImage: { type: String, required: true },
  allImages: [String],
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    brand: { type: String, required: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategory: { type: String },
    tags: {
      isNewArrival: { type: Boolean, default: false },
      isTopPick: { type: Boolean, default: false },
      collectionName: { type: String, default: false },
    },
    colors: [colorSchema],
    size: [String],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);
const Product = mongoose.model("Product", productSchema);
export default Product;
