const express = require("express");
const Product = require("../models/Product");
const redis = require("../config/redis");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

const CACHE_TTL = 60; // Cache time-to-live in seconds

// Helper: safely interact with Redis (graceful if Redis is down)
const getCache = async (key) => {
  try {
    if (redis.status === "ready") {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    }
  } catch {
    return null;
  }
};

const setCache = async (key, data, ttl = CACHE_TTL) => {
  try {
    if (redis.status === "ready") {
      await redis.setex(key, ttl, JSON.stringify(data));
    }
  } catch {
    // Silently fail – caching is an optimisation, not critical
  }
};

const invalidateCache = async (...keys) => {
  try {
    if (redis.status === "ready") {
      await redis.del(...keys);
    }
  } catch {
    // Silently fail
  }
};

// ──────────────────────────────────────────────
// GET /api/products  (Public)
// ──────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    // Try cache first
    const cached = await getCache("products:all");
    if (cached) {
      return res.json({ source: "cache", products: cached });
    }

    const products = await Product.findAll({ order: [["createdAt", "DESC"]] });

    await setCache("products:all", products);

    res.json({ source: "database", products });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products.", error: error.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/products/:id  (Public)
// ──────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const cached = await getCache(`products:${id}`);
    if (cached) {
      return res.json({ source: "cache", product: cached });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await setCache(`products:${id}`, product);

    res.json({ source: "database", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product.", error: error.message });
  }
});

// ──────────────────────────────────────────────
// POST /api/products  (Admin only)
// ──────────────────────────────────────────────
router.post("/", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });

    // Invalidate list cache
    await invalidateCache("products:all");

    res.status(201).json({ message: "Product created.", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to create product.", error: error.message });
  }
});

// ──────────────────────────────────────────────
// PUT /api/products/:id  (Admin only)
// ──────────────────────────────────────────────
router.put("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const { name, description, price, category, stock, imageUrl } = req.body;
    await product.update({ name, description, price, category, stock, imageUrl });

    await invalidateCache("products:all", `products:${req.params.id}`);

    res.json({ message: "Product updated.", product });
  } catch (error) {
    res.status(500).json({ message: "Failed to update product.", error: error.message });
  }
});

// ──────────────────────────────────────────────
// DELETE /api/products/:id  (Admin only)
// ──────────────────────────────────────────────
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    await product.destroy();

    await invalidateCache("products:all", `products:${req.params.id}`);

    res.json({ message: "Product deleted." });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product.", error: error.message });
  }
});

module.exports = router;
