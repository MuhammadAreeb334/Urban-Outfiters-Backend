import express from "express";

const cartRouter = express.Router();

cartRouter.get("/", (req, res) => res.send("Get user cart"));
cartRouter.post("/", (req, res) => res.send("Add/Update to cart"));
cartRouter.delete("/:id", (req, res) => res.send("deleted cart Item"));

export default cartRouter;
