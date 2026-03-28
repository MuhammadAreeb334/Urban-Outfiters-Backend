import express from "express";

const productRouter = express.Router();

productRouter.get("/", (req, res) => res.send("Get All Products."));
productRouter.get("/:id", (req, res) => res.send("Get product by ID"));

export default productRouter;
