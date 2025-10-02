const priceHistory = require("../services/priceHistoryService");
const realTimePrice = require("../services/realTimePriceService");

exports.getProducts = async (req, res) => {
  const { name, brand } = req.query;

  try {
    let filters = {};

    if (name || brand) {
      const conditions = [];

      if (name) {
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

      filters = conditions.length > 1 ? { AND: conditions } : conditions[0];
    }

    const phones = await req.prisma.product.findMany({
      where: filters,
      orderBy: {
        price: "asc",
      },
    });

    const result = await Promise.all(
      phones.map(async (phone) => {
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        let phoneWithPrice = {
          ...phone,
          imageUrl: `${baseUrl}/assets/16pm.png`,
          specs: {
            ...phone.specs,
            display: phone.specs.display || "Not specified",
            cpu: phone.specs.cpu || "Not specified",
            rearCamera: phone.specs.rearCamera || "Not specified",
            frontCamera: phone.specs.frontCamera || "Not specified",
            ramAndStorage: phone.specs.ramAndStorage || "Not specified",
            batteryAndCharging:
              phone.specs.batteryAndCharging || "Not specified",
            operatingSystem: phone.specs.operatingSystem || "Not specified",
            connectivity: phone.specs.connectivity || "Not specified",
          },
        };

        if (phone.price <= 1000) {
          try {
            console.log(
              `🔍 Fetching real-time price for: ${phone.brand} ${phone.name}`
            );

            const livePrices = await realTimePrice.getRealTimePrices(
              phone.name,
              phone.brand
            );

            if (livePrices.cheapest && livePrices.cheapest.price > 0) {
              phoneWithPrice = {
                ...phoneWithPrice,
                realTimePrice: livePrices.cheapest.price,
                priceComparison: livePrices.prices,
                cheapestSource: livePrices.cheapest.source,
                lastPriceUpdate: livePrices.lastUpdated,
              };
            }
          } catch (error) {
            console.error(
              `❌ Error fetching real-time price for ${phone.name}:`,
              error.message
            );
          }
        }

        return phoneWithPrice;
      })
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const phone = await req.prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: {
        priceHistory: {
          orderBy: {
            date: "desc",
          },
          take: 30,
        },
      },
    });

    if (!phone) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(
      "💾 Existing price history length:",
      phone.priceHistory ? phone.priceHistory.length : 0
    );

    if (!phone.priceHistory || phone.priceHistory.length < 5) {
      console.log(
        `🔍 Comprehensive price search for: ${phone.brand} ${phone.name}`
      );

      try {
        const historyData = await priceHistory.getPriceHistoryByProduct(
          phone.name,
          phone.brand,
          phone.price
        );

        console.log(
          `📊 Retrieved ${historyData.length} price points from comprehensive search`
        );

        if (historyData && historyData.length > 0) {
          console.log("💾 Saving price history to database...");

          await req.prisma.priceHistory.deleteMany({
            where: { productId: phone.id },
          });

          for (const point of historyData) {
            await req.prisma.priceHistory.create({
              data: {
                productId: phone.id,
                price: point.price,
                date: new Date(point.date),
              },
            });
          }

          const updatedPhone = await req.prisma.product.findUnique({
            where: { id: parseInt(id) },
            include: {
              priceHistory: {
                orderBy: {
                  date: "asc",
                },
                take: 30,
              },
            },
          });

          console.log("✅ Successfully updated price history in database");
          return res.json(updatedPhone);
        }
      } catch (error) {
        console.error(
          "💥 Error fetching comprehensive price data:",
          error.message
        );
      }
    }

    if (phone.priceHistory && phone.priceHistory.length > 0) {
      phone.priceHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const formattedPhone = {
      ...phone,
      imageUrl: `${baseUrl}/assets/16pm.png`,
      specs: {
        ...phone.specs,
        display: phone.specs.display || "Not specified",
        cpu: phone.specs.cpu || "Not specified",
        rearCamera: phone.specs.rearCamera || "Not specified",
        frontCamera: phone.specs.frontCamera || "Not specified",
        ramAndStorage: phone.specs.ramAndStorage || "Not specified",
        batteryAndCharging: phone.specs.batteryAndCharging || "Not specified",
        operatingSystem: phone.specs.operatingSystem || "Not specified",
        connectivity: phone.specs.connectivity || "Not specified",
      },
    };

    try {
      console.log(
        `💰 Fetching real-time prices for: ${phone.brand} ${phone.name}`
      );
      const livePrices = await realTimePrice.getRealTimePrices(
        phone.name,
        phone.brand
      );

      const phoneWithPrice = {
        ...formattedPhone,
        realTimePrice: livePrices.cheapest
          ? livePrices.cheapest.price
          : phone.price,
        priceComparison: livePrices.prices,
        cheapestSource: livePrices.cheapest ? livePrices.cheapest.source : null,
        lastPriceUpdate: livePrices.lastUpdated,
      };

      console.log(
        `📱 Returning product with ${
          phone.priceHistory ? phone.priceHistory.length : 0
        } price history entries and real-time price: ₹${
          phoneWithPrice.realTimePrice
        }`
      );

      res.json(phoneWithPrice);
    } catch (error) {
      console.error("💥 Error fetching real-time prices:", error.message);

      const phoneWithFallback = {
        ...formattedPhone,
        realTimePrice: phone.price,
        priceComparison: {},
        cheapestSource: null,
        lastPriceUpdate: null,
      };

      console.log(
        `📱 Returning product with ${
          phone.priceHistory ? phone.priceHistory.length : 0
        } price history entries (fallback price: ₹${phone.price})`
      );

      res.json(phoneWithFallback);
    }
  } catch (err) {
    console.error("💥 Error in getProductById:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getRealTimePrice = async (req, res) => {
  const { id } = req.params;

  try {
    const phone = await req.prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!phone) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log(
      `💰 Fetching real-time prices for: ${phone.brand} ${phone.name}`
    );

    const livePrices = await realTimePrice.getRealTimePrices(
      phone.name,
      phone.brand
    );

    res.json({
      productId: phone.id,
      productName: `${phone.brand} ${phone.name}`,
      originalPrice: phone.price,
      realTimePrices: livePrices.prices,
      cheapest: livePrices.cheapest,
      lastUpdated: livePrices.lastUpdated,
      savings: livePrices.cheapest
        ? Math.max(0, phone.price - livePrices.cheapest.price)
        : 0,
    });
  } catch (error) {
    console.error("💥 Error fetching real-time prices:", error.message);
    res.status(500).json({ error: error.message });
  }
};
