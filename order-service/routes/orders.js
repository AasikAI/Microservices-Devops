const express = require("express");
const axios = require("axios");
const Order = require("../models/Order");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || "http://localhost:5002";

// ──────────────────────────────────────────────
// POST /api/orders  (Authenticated users)
// ──────────────────────────────────────────────
router.post("/", authenticate, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item." });
    }

    // Validate each product exists and has enough stock via Product Service
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      try {
        const { data } = await axios.get(`${PRODUCT_SERVICE}/api/products/${item.productId}`);
        const product = data.product;

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for "${product.name}". Available: ${product.stock}`,
          });
        }

        validatedItems.push({
          productId: product.id,
          productName: product.name,
          price: parseFloat(product.price),
          quantity: item.quantity,
        });

        totalAmount += parseFloat(product.price) * item.quantity;
      } catch (err) {
        return res.status(400).json({
          message: `Product with ID "${item.productId}" not found.`,
        });
      }
    }

    const order = await Order.create({
      userId: req.user.id,
      userEmail: req.user.email,
      items: validatedItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      shippingAddress,
    });

    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order.", error: error.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/orders  (Authenticated – own orders / Admin sees all)
// ──────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };
    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders.", error: error.message });
  }
});

// ──────────────────────────────────────────────
// GET /api/orders/:id  (Authenticated – own order or admin)
// ──────────────────────────────────────────────
router.get("/:id", authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Users can only view their own orders
    if (req.user.role !== "admin" && order.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order.", error: error.message });
  }
});

// ──────────────────────────────────────────────
// PATCH /api/orders/:id/status  (Admin only)
// ──────────────────────────────────────────────
router.patch("/:id/status", authenticate, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({ message: "Order status updated.", order });
  } catch (error) {
    res.status(500).json({ message: "Failed to update order.", error: error.message });
  }
});

module.exports = router;
