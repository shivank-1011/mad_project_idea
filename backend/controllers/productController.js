exports.getProducts = async (req, res) => {
    const { name, brand } = req.query;
    const filters = {};
    if (name) filters.name = { contains: name };
    if (brand) filters.brand = brand;

    try {
        const products = await req.prisma.product.findMany({
            where: filters,
            include: { priceHistory: true }
        });
        res.json(products);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await req.prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: { priceHistory: true }
        });
        res.json(product);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

