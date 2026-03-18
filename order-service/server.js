const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const orderRoutes = require("./routes/orders");

// Load environment variables
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────
app.use("/api/orders", orderRoutes);

// ── Health Check ─────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "order-service" });
});

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5003;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Order Service] Running on port ${PORT}`);
  });
};

startServer();
