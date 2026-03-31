import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { 
  processAndSaveFiles, 
  cleanupTempFiles, 
  deleteMultipleImageFiles,
  deleteImageFile
} from "../utils/fileProcessor.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const baseUploadPath = path.join(__dirname, "..", "upload");

const sendErrorAndCleanup = (res, req, statusCode, message) => {
  cleanupTempFiles(req);
  return res.status(statusCode).json({ message });
};

export const createProduct = async (req, res) => {
  let savedFiles = [];
  
  try {
    let {
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

    if (!title || !brand || !price || !category) {
      return sendErrorAndCleanup(res, req, 400, "Missing required fields");
    }

    const categoryDoc = await Category.findOne({ slug: category });
    if (!categoryDoc) {
      return sendErrorAndCleanup(res, req, 400, "Invalid category slug");
    }
    const categoryId = categoryDoc._id;

    let parsedTags = tags;
    if (typeof tags === "string") {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        return sendErrorAndCleanup(res, req, 400, "Invalid tags JSON");
      }
    }

    let parsedColors;
    try {
      parsedColors =
        typeof req.body.colors === "string"
          ? JSON.parse(req.body.colors)
          : req.body.colors;
    } catch {
      return sendErrorAndCleanup(res, req, 400, "Invalid colors JSON");
    }

    if (!parsedColors || !parsedColors.length) {
      return sendErrorAndCleanup(res, req, 400, "Colors are required");
    }

    let parsedSize = size;
    if (typeof size === "string") {
      try {
        parsedSize = JSON.parse(size);
      } catch {
        return sendErrorAndCleanup(res, req, 400, "Invalid size JSON");
      }
    }

    if (!req.tempFiles || !req.tempFiles.length) {
      return sendErrorAndCleanup(res, req, 400, "No files uploaded");
    }

    const tempFileMap = {};
    req.tempFiles.forEach((file) => {
      if (!tempFileMap[file.fieldname]) {
        tempFileMap[file.fieldname] = [];
      }
      tempFileMap[file.fieldname].push(file);
    });
    
    for (const color of parsedColors) {
      const key = color.key;
      const mainImages = tempFileMap[`mainImage_${key}`];
      const hoverImages = tempFileMap[`hoverImage_${key}`];
      
      if (!mainImages || mainImages.length === 0) {
        return sendErrorAndCleanup(res, req, 400, `Missing main image for color ${color.name}`);
      }
      if (!hoverImages || hoverImages.length === 0) {
        return sendErrorAndCleanup(res, req, 400, `Missing hover image for color ${color.name}`);
      }
    }

    savedFiles = await processAndSaveFiles(req.tempFiles, baseUploadPath);
    
    const fileMap = {};
    savedFiles.forEach((file) => {
      if (!fileMap[file.originalFieldname]) {
        fileMap[file.originalFieldname] = [];
      }
      fileMap[file.originalFieldname].push(file);
    });
    
    parsedColors.forEach((color) => {
      const key = color.key;
      
      const main = fileMap[`mainImage_${key}`]?.[0];
      const hover = fileMap[`hoverImage_${key}`]?.[0];
      const gallery = fileMap[`gallery_${key}`] || [];
      
      color.images = {
        main: main?.path || null,
        hover: hover?.path || null,
        gallery: gallery.map((f) => f.path),
      };
    });
    
    const parsedPrice = Number(price);
    const parsedSalePrice = salePrice ? Number(salePrice) : undefined;
    const parsedRating = rating ? Number(rating) : 0;
    const parsedReviewCount = reviewCount ? Number(reviewCount) : 0;
    
    const product = new Product({
      title,
      brand,
      price: parsedPrice,
      salePrice: parsedSalePrice,
      description,
      category: categoryId,
      subCategory,
      tags: parsedTags || { isNewArrival: false, isTopPick: false, collectionName: "" },
      colors: parsedColors,
      size: parsedSize || [],
      rating: parsedRating,
      reviewCount: parsedReviewCount,
    });
    
    await product.save();
    
    cleanupTempFiles(req);
    
    const populatedProduct = await Product.findById(product._id).populate("category");
    
    res.status(201).json({
      message: "Product created successfully",
      product: populatedProduct,
    });
    
  } catch (error) {
    if (savedFiles.length > 0) {
      const filePaths = savedFiles.map(file => file.path);
      deleteMultipleImageFiles(filePaths);
    }
    
    cleanupTempFiles(req);
    
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  let savedFiles = [];
  let oldImagePaths = [];
  
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      cleanupTempFiles(req);
      return res.status(404).json({ message: "Product not found" });
    }
    
    let {
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
    } = updateData;
    
    if (title !== undefined && !title) {
      cleanupTempFiles(req);
      return res.status(400).json({ message: "Title cannot be empty" });
    }
    
    if (brand !== undefined && !brand) {
      cleanupTempFiles(req);
      return res.status(400).json({ message: "Brand cannot be empty" });
    }
    
    if (price !== undefined && !price) {
      cleanupTempFiles(req);
      return res.status(400).json({ message: "Price cannot be empty" });
    }
    
    let categoryId = existingProduct.category;
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (!categoryDoc) {
        cleanupTempFiles(req);
        return res.status(400).json({ message: "Invalid category slug" });
      }
      categoryId = categoryDoc._id;
    }
    
    let parsedTags = existingProduct.tags;
    if (tags !== undefined) {
      if (typeof tags === "string") {
        try {
          parsedTags = JSON.parse(tags);
        } catch {
          cleanupTempFiles(req);
          return res.status(400).json({ message: "Invalid tags JSON" });
        }
      } else {
        parsedTags = tags;
      }
    }
    
    let parsedColors = existingProduct.colors;
    let isColorsUpdated = false;
    
    if (colors !== undefined) {
      try {
        parsedColors =
          typeof colors === "string"
            ? JSON.parse(colors)
            : colors;
        isColorsUpdated = true;
        
        if (!parsedColors || !parsedColors.length) {
          cleanupTempFiles(req);
          return res.status(400).json({ message: "Colors cannot be empty" });
        }
      } catch {
        cleanupTempFiles(req);
        return res.status(400).json({ message: "Invalid colors JSON" });
      }
    }
    
    let parsedSize = existingProduct.size;
    if (size !== undefined) {
      if (typeof size === "string") {
        try {
          parsedSize = JSON.parse(size);
        } catch {
          cleanupTempFiles(req);
          return res.status(400).json({ message: "Invalid size JSON" });
        }
      } else {
        parsedSize = size;
      }
    }
    
    if (req.tempFiles && req.tempFiles.length > 0) {
      const tempFileMap = {};
      req.tempFiles.forEach((file) => {
        if (!tempFileMap[file.fieldname]) {
          tempFileMap[file.fieldname] = [];
        }
        tempFileMap[file.fieldname].push(file);
      });
      
      if (isColorsUpdated) {
        for (const color of parsedColors) {
          const key = color.key;
          const mainImages = tempFileMap[`mainImage_${key}`];
          const hoverImages = tempFileMap[`hoverImage_${key}`];
          
          const existingColor = existingProduct.colors.find(c => c.key === key);
          if (!existingColor || (mainImages && mainImages.length > 0) || (hoverImages && hoverImages.length > 0)) {
            if (!mainImages || mainImages.length === 0) {
              cleanupTempFiles(req);
              return res.status(400).json({ message: `Missing main image for color ${color.name}` });
            }
            if (!hoverImages || hoverImages.length === 0) {
              cleanupTempFiles(req);
              return res.status(400).json({ message: `Missing hover image for color ${color.name}` });
            }
          }
        }
      }
      
      savedFiles = await processAndSaveFiles(req.tempFiles, baseUploadPath);
      
      const fileMap = {};
      savedFiles.forEach((file) => {
        if (!fileMap[file.originalFieldname]) {
          fileMap[file.originalFieldname] = [];
        }
        fileMap[file.originalFieldname].push(file);
      });
      
      if (isColorsUpdated) {
        existingProduct.colors.forEach(color => {
          if (color.images?.main) oldImagePaths.push(color.images.main);
          if (color.images?.hover) oldImagePaths.push(color.images.hover);
          if (color.images?.gallery) oldImagePaths.push(...color.images.gallery);
        });
        
        parsedColors.forEach((color) => {
          const key = color.key;
          const existingColor = existingProduct.colors.find(c => c.key === key);
          
          const main = fileMap[`mainImage_${key}`]?.[0];
          const hover = fileMap[`hoverImage_${key}`]?.[0];
          const gallery = fileMap[`gallery_${key}`] || [];
          
          color.images = {
            main: main?.path || existingColor?.images?.main || null,
            hover: hover?.path || existingColor?.images?.hover || null,
            gallery: gallery.length > 0 
              ? gallery.map((f) => f.path) 
              : (existingColor?.images?.gallery || [])
          };
        });
      }
    }
    
    const parsedPrice = price !== undefined ? Number(price) : existingProduct.price;
    const parsedSalePrice = salePrice !== undefined ? (salePrice ? Number(salePrice) : undefined) : existingProduct.salePrice;
    const parsedRating = rating !== undefined ? Number(rating) : existingProduct.rating;
    const parsedReviewCount = reviewCount !== undefined ? Number(reviewCount) : existingProduct.reviewCount;
    
    const updateObject = {
      title: title !== undefined ? title : existingProduct.title,
      brand: brand !== undefined ? brand : existingProduct.brand,
      price: parsedPrice,
      salePrice: parsedSalePrice,
      description: description !== undefined ? description : existingProduct.description,
      category: categoryId,
      subCategory: subCategory !== undefined ? subCategory : existingProduct.subCategory,
      tags: parsedTags,
      colors: parsedColors,
      size: parsedSize,
      rating: parsedRating,
      reviewCount: parsedReviewCount,
    };
    
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateObject,
      { new: true, runValidators: true }
    ).populate("category");
    
    if (oldImagePaths.length > 0) {
      deleteMultipleImageFiles(oldImagePaths);
    }
    
    cleanupTempFiles(req);
    
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct
    });
    
  } catch (error) {
    if (savedFiles.length > 0) {
      const filePaths = savedFiles.map(file => file.path);
      deleteMultipleImageFiles(filePaths);
    }
    
    cleanupTempFiles(req);
    
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    const imagePaths = [];
    if (product.colors && product.colors.length) {
      product.colors.forEach(color => {
        if (color.images?.main) imagePaths.push(color.images.main);
        if (color.images?.hover) imagePaths.push(color.images.hover);
        if (color.images?.gallery && color.images.gallery.length) {
          imagePaths.push(...color.images.gallery);
        }
      });
    }
    
    await Product.findByIdAndDelete(id);
    
    if (imagePaths.length > 0) {
      deleteMultipleImageFiles(imagePaths);
    }
    
    res.status(200).json({ 
      message: "Product deleted successfully",
      deletedImagesCount: imagePaths.length
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const patchProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const product = await Product.findById(id);
    if (!product) {
      cleanupTempFiles(req);
      return res.status(404).json({ message: "Product not found" });
    }
    
    let savedFiles = [];
    let oldImagePaths = [];
    
    if (req.tempFiles && req.tempFiles.length > 0) {
      savedFiles = await processAndSaveFiles(req.tempFiles, baseUploadPath);
      
      const fileMap = {};
      savedFiles.forEach((file) => {
        if (!fileMap[file.originalFieldname]) {
          fileMap[file.originalFieldname] = [];
        }
        fileMap[file.originalFieldname].push(file);
      });
      
      for (const [fieldname, files] of Object.entries(fileMap)) {
        if (fieldname.startsWith('mainImage_')) {
          const colorKey = fieldname.split('_')[1];
          const color = product.colors.find(c => c.key === colorKey);
          if (color && color.images?.main) {
            oldImagePaths.push(color.images.main);
            color.images.main = files[0].path;
          }
        } else if (fieldname.startsWith('hoverImage_')) {
          const colorKey = fieldname.split('_')[1];
          const color = product.colors.find(c => c.key === colorKey);
          if (color && color.images?.hover) {
            oldImagePaths.push(color.images.hover);
            color.images.hover = files[0].path;
          }
        } else if (fieldname.startsWith('gallery_')) {
          const colorKey = fieldname.split('_')[1];
          const color = product.colors.find(c => c.key === colorKey);
          if (color && color.images?.gallery) {
            oldImagePaths.push(...color.images.gallery);
            color.images.gallery = files.map(f => f.path);
          }
        }
      }
      
      await product.save();
    }
    
    const allowedUpdates = ['title', 'brand', 'price', 'salePrice', 'description', 'subCategory', 'tags', 'size', 'rating', 'reviewCount'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'tags' && typeof updates[field] === 'string') {
          product[field] = JSON.parse(updates[field]);
        } else if (field === 'size' && typeof updates[field] === 'string') {
          product[field] = JSON.parse(updates[field]);
        } else {
          product[field] = updates[field];
        }
      }
    });
    
    await product.save();
    
    if (oldImagePaths.length > 0) {
      deleteMultipleImageFiles(oldImagePaths);
    }
    
    cleanupTempFiles(req);
    
    const populatedProduct = await Product.findById(id).populate("category");
    
    res.status(200).json({
      message: "Product updated successfully",
      product: populatedProduct
    });
    
  } catch (error) {
    if (savedFiles && savedFiles.length > 0) {
      const filePaths = savedFiles.map(file => file.path);
      deleteMultipleImageFiles(filePaths);
    }
    
    cleanupTempFiles(req);
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