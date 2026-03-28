import express from "express";

const categoryRouter = express.Router();

categoryRouter.get("/", (req, res) => res.send("Get all category"));
categoryRouter.get("/:slug", (req, res) => res.send("Get category by Slug"));

export default categoryRouter;
