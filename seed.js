import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import Category from "./models/Category.js";

dotenv.config();

const products = [
  {
    id: "na-001",
    title: "UO Lara Ribbed Halter Top",
    brand: "Urban Outfitters",
    price: 34.0,
    salePrice: 24.99,
    category: "new",
    rating: 0,
    reviewCount: 0,
    selectedColor: "Cream",
    colors: [
      {
        name: "Cream",
        hex: "#F5F5DC",
        main: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
        hover:
          "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600",
      },
      {
        name: "Charcoal",
        hex: "#333333",
        main: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
        hover:
          "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600",
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "w-001",
    title: "Floral Summer Dress",
    brand: "Bloom Wear",
    price: 65.0,
    salePrice: 59.99,
    category: "womens",
    rating: 0,
    reviewCount: 0,
    selectedColor: "Floral White",
    colors: [
      {
        name: "Floral White",
        hex: "#FFFFFF",
        main: "https://images.unsplash.com/photo-1675351735954-fd05be781315?w=500",
        hover:
          "https://images.unsplash.com/photo-1675353034519-a6463cd8217a?w=500",
      },
      {
        name: "Pastel Pink",
        hex: "#FFD1DC",
        main: "https://images.unsplash.com/photo-1653152566529-c3b44fd5efea?w=500",
        hover:
          "https://images.unsplash.com/photo-1617548807833-1742f85ae364?w=500",
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "m-001",
    title: "Classic Crewneck Tee",
    brand: "Essential Studio",
    price: 24.99,
    salePrice: 19.99,
    category: "mens",
    rating: 0,
    reviewCount: 0,
    selectedColor: "White",
    colors: [
      {
        name: "White",
        hex: "#FFFFFF",
        main: "https://plus.unsplash.com/premium_photo-1688497831384-e40b2e5615cd?w=500",
        hover:
          "https://plus.unsplash.com/premium_photo-1688497830977-f9ab9f958ca7?w=500",
      },
      {
        name: "Gray",
        hex: "#D3D3D3",
        main: "https://images.unsplash.com/photo-1633323275809-c4ff4a3adb8e?w=500",
        hover:
          "https://images.unsplash.com/photo-1633323275809-c4ff4a3adb8e?w=500",
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: "s-001",
    title: "White Minimal Sneakers",
    brand: "StreetStep",
    price: 85.0,
    salePrice: 75.0,
    category: "shoes",
    rating: 0,
    reviewCount: 0,
    selectedColor: "White",
    colors: [
      {
        name: "White",
        hex: "#FFFFFF",
        main: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
        hover:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
      },
      {
        name: "Gray",
        hex: "#D3D3D3",
        main: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
        hover:
          "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500",
      },
    ],
    sizes: ["39", "40", "41", "42", "43", "44"],
  },
  {
    id: "a-001",
    title: "Minimal Leather Backpack",
    brand: "Urban Carry",
    price: 120.0,
    salePrice: 105.0,
    category: "accessories",
    rating: 0,
    reviewCount: 0,
    selectedColor: "Black",
    colors: [
      {
        name: "Black",
        hex: "#000000",
        main: "https://plus.unsplash.com/premium_photo-1770613267771-cc8d2966d516?w=500",
        hover:
          "https://images.unsplash.com/photo-1758798689719-5b554ac3b65a?w=500",
      },
      {
        name: "Brown",
        hex: "#8B4513",
        main: "https://images.unsplash.com/photo-1758798689719-5b554ac3b65a?w=500",
        hover:
          "https://plus.unsplash.com/premium_photo-1770613267771-cc8d2966d516?w=500",
      },
    ],
    sizes: ["One Size"],
  },
  {
    id: "h-001",
    title: "Handcrafted Ceramic Vase",
    brand: "HomeCraft",
    price: 45.0,
    salePrice: 45.0,
    category: "home",
    rating: 0,
    reviewCount: 0,
    selectedColor: "White",
    colors: [
      {
        name: "White",
        hex: "#FFFFFF",
        main: "https://images.unsplash.com/photo-1616432541912-fbc3dff3a9fd?w=500",
        hover:
          "https://images.unsplash.com/photo-1564540583246-934409427776?w=500",
      },
      {
        name: "Cream",
        hex: "#FFFDD0",
        main: "https://images.unsplash.com/photo-1564540583246-934409427776?w=500",
        hover:
          "https://images.unsplash.com/photo-1616432541912-fbc3dff3a9fd?w=500",
      },
    ],
    sizes: ["One Size"],
  },
  {
    id: "bw-001",
    title: "Organic Rose Face Serum",
    brand: "Nature Glow",
    price: 38.0,
    salePrice: 38.0,
    category: "beauty-wellness",
    rating: 0,
    reviewCount: 0,
    selectedColor: "Rose",
    colors: [
      {
        name: "Rose",
        hex: "#FFC0CB",
        main: "https://plus.unsplash.com/premium_photo-1679046948726-72f7d53296c5?w=500",
        hover:
          "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=500",
      },
    ],
    sizes: ["One Size"],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    await Product.deleteMany();
    await Category.deleteMany();
    console.log("Cleared database.");

    const categoryNames = [...new Set(products.map((p) => p.category))];
    const categoryMap = {};

    for (const name of categoryNames) {
      const category = await Category.create({
        name: name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        image:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
        description: `Explore our collection of ${name}`,
      });
      categoryMap[name] = category._id;
    }
    console.log(`Created ${categoryNames.length} categories.`);

    const formattedProducts = products.map((p) => ({
      title: p.title,
      brand: p.brand,
      price: p.price,
      salePrice: p.salePrice || p.price,
      category: categoryMap[p.category], // Linking to the Category ID
      rating: p.rating || 0,
      reviewCount: p.reviewCount || 0,
      sizes: p.sizes,
      colors: p.colors.map((c) => ({
        name: c.name,
        hex: c.hex,
        mainImage: c.main,
        hoverImage: c.hover,
        allImages: [c.main, c.hover],
      })),
    }));

    await Product.insertMany(formattedProducts);
    console.log("Successfully seeded products!");
    process.exit();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};
seedDatabase();
