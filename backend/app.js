const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("./generated/prisma");
const productRoutes = require("./routes/productRoutes");
const aiRoutes = require("./routes/aiRoutes");
const adminRoutes = require("./routes/adminRoutes");

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin/scraper", adminRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  console.error("Stack trace:", err.stack);
  res.status(500).json({
    error: err.message || "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;
