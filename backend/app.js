const express = require('express');
const { PrismaClient } = require('@prisma/client');
const productRoutes = require('./routes/productRoutes');
const aiRoutes = require('./routes/aiRoutes');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.use((req, res, next) => {
    req.prisma = prisma;
    next();
});

app.use('/api/products', productRoutes);
app.use('/api/ai', aiRoutes);

module.exports = app;
