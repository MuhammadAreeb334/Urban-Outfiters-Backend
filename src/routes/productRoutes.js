import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  patchProduct,
  updateProduct,
} from "../controllers/productController.js";
import { updateProductImages, uploadProductImages } from "../middleware/customMulterStorage.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.get("/category/:categorySlug", getProductsByCategory);


productRouter.post("/", uploadProductImages, createProduct);
productRouter.put("/:id", updateProductImages, updateProduct);
productRouter.patch("/:id", updateProductImages, patchProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;
