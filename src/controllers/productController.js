import Category from "../models/Category.js";
import Product from "../models/Product.js";
import fs from "fs";
import path from "path";
import { json } from "stream/consumers";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper Functions

const deleteImageFile = (imagePath) => {
  if (imagePath) {
    const fullPath = path.join(__dirname, "..", imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Deleted image: ${fullPath}`);
    }
  }
};

const deleteMultipleImageFiles = (imagePath) => {
  if (imagePath && Array.isArray(imagePath)) {
    imagePath.forEach((imagePath) => {
      if (imagePath) {
        const fullPath = path.join(__dirname, "..", imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Deleted image: ${fullPath}`);
        }
      }
    });
  }
};

const normalizeImagePath = (filePath) => {
  const relativePath = path.relative(process.cwd(), filePath);
  return relativePath.replace(/\\/g, "/");
};

export const createProduct = async (req, res) => {
  try {
    const {
      title,
      brand,
      price,
      salePrice,
      description,
      category,
      subCategory,
      tags,
      colors,
      size,
      rating,
      reviewCount,
    } = req.body;

    const mainImage = req?.files?.mainImage
      ? normalizeImagePath(req.files.mainImage[0].path)
      : null;

    const hoverImage = req?.files?.hoverImage
      ? normalizeImagePath(req.files.hoverImage[0].path)
      : null;

    const allImages = req?.files?.allImages
      ? req.files.allImages.map((file) => normalizeImagePath(file.path))
      : [];

    if (!title || !brand || !price || !category || !mainImage || !hoverImage) {
      if (mainImage) deleteImageFile(mainImage);
      if (hoverImage) deleteImageFile(hoverImage);
      if (allImages.length) deleteMultipleImageFiles(allImages);

      return res.status(400).json({ message: "Missing required fields" });
    }

    let parsedTags = tags;
    if (typeof tags === "string") {
      parsedTags = JSON.parse(tags);
    }

    let parsedColor = colors;
    if (typeof colors === "string") {
      parsedTags = JSON.parse(colors);
    }

    let parsedSize = size;
    if (typeof size === "string") {
      parsedSize = JSON.parse(size);
    }

    const product = new Product({
      title,
      brand,
      price,
      salePrice: salePrice || undefined,
      description,
      category,
      subCategory,
      tags: parsedTags || {},
      colors: parsedColors || [],
      size: parsedSize || [],
      rating: rating || 0,
      reviewCount: reviewCount || 0,
      mainImage,
      hoverImage,
      allImages,
    });
    await product.save();
    const populatedProduct = await Product.findById(product._id).populate(
      "category",
    );
  } catch (error) {
    if (req.files) {
      if (req.files.mainImage)
        deleteImageFile(normalizeImagePath(req.files.mainImage[0].path));
      if (req.files.hoverImage)
        deleteImageFile(normalizeImagePath(req.files.hoverImage[0].path));
      if (req.files.allImages)
        deleteMultipleImageFiles(
          req.files.allImages.map((file) => normalizeImagePath(file.path)),
        );
    }

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate("category");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const products = await Product.find({ category: category._id }).populate(
      "category",
    );
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
