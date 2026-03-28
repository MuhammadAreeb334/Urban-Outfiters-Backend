import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import productRouter from "./routes/productRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import userRouter from "./routes/userRoutes.js";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("api/products", productRouter);
app.use("api/categories", categoryRouter);
app.use("api/user", userRouter);
app.use("api/cart", cartRouter);
app.use("api/order", orderRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Urban Outfitters API is running...",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect DB:", error.message);
    process.exit(1);
  }
};
startServer();
