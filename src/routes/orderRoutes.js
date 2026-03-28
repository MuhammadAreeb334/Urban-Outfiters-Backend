import express from "express";

const orderRouter = express.Router();

orderRouter.post("/", (req, res) => res.send("Create new order"));
orderRouter.get("/myorders", (req, res) => res.send("Get user order history"));
orderRouter.get("/:id", (req, res) => res.send("Get order detail by ID"));

export default orderRouter;
