exports.getProducts = async (req, res) => {
  const { name, brand } = req.query;

  try {
    let whereClause = {};

    // Build where clause
    if (name || brand) {
      const conditions = [];

      if (name) {
        // Case-insensitive search on name
        conditions.push({
          name: {
            contains: name,
          },
        });
      }

      if (brand) {
        conditions.push({
          brand: {
            equals: brand,
          },
        });
      }

      whereClause = conditions.length > 1 ? { AND: conditions } : conditions[0];
    }

    const products = await req.prisma.product.findMany({
      where: whereClause,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await req.prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
