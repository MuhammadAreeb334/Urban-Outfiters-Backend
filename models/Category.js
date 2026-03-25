import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "new",
        "womens",
        "mens",
        "shoes",
        "accessories",
        "home",
        "beauty-wellness",
        "brands",
      ],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    subCategories: [
      {
        name: { type: String },
        slug: { type: String },
      },
    ],
  },
  { timestamps: true },
);
const Category = mongoose.model("Category", categorySchema);
export default Category;
