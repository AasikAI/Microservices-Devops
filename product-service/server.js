const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize, connectDB } = require("./config/db");
const Product = require("./models/Product");
const productRoutes = require("./routes/products");

// Load environment variables
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────
app.use("/api/products", productRoutes);

// ── Health Check ─────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "product-service" });
});

// ── Seed sample data ─────────────────────────
const seedProducts = async () => {
  const count = await Product.count();
  if (count === 0) {
    await Product.bulkCreate([
      {
        name: "Wireless Bluetooth Headphones",
        description: "Premium noise-cancelling headphones with 30-hour battery life.",
        price: 79.99,
        category: "Electronics",
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300",
      },
      {
        name: "Organic Cotton T-Shirt",
        description: "Comfortable 100% organic cotton t-shirt available in multiple colors.",
        price: 24.99,
        category: "Clothing",
        stock: 200,
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300",
      },
      {
        name: "Stainless Steel Water Bottle",
        description: "Double-walled insulated bottle that keeps drinks cold for 24 hours.",
        price: 34.99,
        category: "Kitchen",
        stock: 150,
        imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300",
      },
      {
        name: "JavaScript: The Good Parts",
        description: "Classic programming book by Douglas Crockford.",
        price: 19.99,
        category: "Books",
        stock: 80,
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300",
      },
      {
        name: "Mechanical Keyboard",
        description: "RGB backlit mechanical keyboard with Cherry MX switches.",
        price: 129.99,
        category: "Electronics",
        stock: 30,
        imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=300",
      },
      {
        name: "Running Shoes",
        description: "Lightweight running shoes with responsive cushioning.",
        price: 89.99,
        category: "Sports",
        stock: 100,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300",
      },
    ]);
    console.log("[Product Service] Sample products seeded.");
  }
};

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5002;

const startServer = async () => {
  await connectDB();
  await sequelize.sync(); // Create tables if they don't exist
  await seedProducts();
  app.listen(PORT, () => {
    console.log(`[Product Service] Running on port ${PORT}`);
  });
};

startServer();
