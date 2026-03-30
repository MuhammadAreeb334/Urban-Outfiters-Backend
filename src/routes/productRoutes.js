import express from "express";
import {
    createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
} from "../controllers/productController.js";
import { uploadProductImages } from "../config/multer.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.get("/category/:categorySlug", getProductsByCategory)

productRouter.post("/", uploadProductImages, createProduct);

export default productRouter;
