const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");

// Load environment variables
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Routes ───────────────────────────────────
app.use("/api/auth", authRoutes);

// ── Health Check ─────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "OK", service: "auth-service" });
});

// ── Start Server ─────────────────────────────
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Auth Service] Running on port ${PORT}`);
  });
};

startServer();
