const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("./generated/prisma");
const productRoutes = require("./routes/productRoutes");
const aiRoutes = require("./routes/aiRoutes");

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

app.use("/api/products", productRoutes);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

module.exports = app;
