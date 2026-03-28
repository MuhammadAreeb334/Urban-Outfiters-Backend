import express from "express";

const userRouter = express.Router();

userRouter.post("/login", (req, res) => res.send("Login User"));
userRouter.post("/register", (req, res) => res.send("Register user"));

userRouter.get("/wishlist", (req, res) => res.send("Get user wishlist"));
userRouter.post("/wishlist/:id", (req, res) =>
  res.send("Toggle wishlist product"),
);

export default userRouter;
