const express = require("express");
const phoneDataScheduler = require("../services/phoneDataScheduler");
const phoneScraperService = require("../services/phoneScraperService");
const phoneDataNormalizer = require("../services/phoneDataNormalizer");

const router = express.Router();

/**
 * Get scraper statistics and status
 */
router.get("/status", async (req, res) => {
  try {
    const stats = phoneDataScheduler.getStats();

    res.json({
      status: "success",
      data: {
        ...stats,
        message: stats.isRunning
          ? "Scraping job is currently running"
          : "Scheduler is ready",
      },
    });
  } catch (error) {
    console.error("Error getting scraper status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get scraper status",
      error: error.message,
    });
  }
});

/**
 * Manually trigger full phone data scrape
 */
router.post("/scrape/full", async (req, res) => {
  try {
    if (phoneDataScheduler.getStats().isRunning) {
      return res.status(409).json({
        status: "error",
        message:
          "A scraping job is already running. Please wait for it to complete.",
      });
    }

    // Start the scraping process (don't wait for completion)
    phoneDataScheduler.triggerFullScrape().catch((error) => {
      console.error("Background scraping failed:", error);
    });

    res.json({
      status: "success",
      message:
        "Full scrape initiated. This will take 10-15 minutes to complete.",
      data: {
        estimatedDuration: "10-15 minutes",
        checkStatusUrl: "/api/admin/scraper/status",
      },
    });
  } catch (error) {
    console.error("Error triggering full scrape:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to start scraping job",
      error: error.message,
    });
  }
});

/**
 * Manually trigger price update for existing phones
 */
router.post("/scrape/prices", async (req, res) => {
  try {
    if (phoneDataScheduler.getStats().isRunning) {
      return res.status(409).json({
        status: "error",
        message:
          "A scraping job is already running. Please wait for it to complete.",
      });
    }

    // Start the price update process
    phoneDataScheduler.triggerPriceUpdate().catch((error) => {
      console.error("Background price update failed:", error);
    });

    res.json({
      status: "success",
      message:
        "Price update initiated. This will take a few minutes to complete.",
      data: {
        estimatedDuration: "3-5 minutes",
        checkStatusUrl: "/api/admin/scraper/status",
      },
    });
  } catch (error) {
    console.error("Error triggering price update:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to start price update job",
      error: error.message,
    });
  }
});

/**
 * Test scraping a small sample without saving to database
 */
router.post("/scrape/test", async (req, res) => {
  try {
    console.log("🧪 Testing scraper with small sample...");

    // Override the maxPagesPerSource for testing
    const originalMaxPages = phoneScraperService.maxPagesPerSource;
    phoneScraperService.maxPagesPerSource = 1;

    const rawPhones = await phoneScraperService.scrapeAllPhones();
    const normalizedPhones = await phoneDataNormalizer.normalizePhones(
      rawPhones.slice(0, 10)
    ); // Test with first 10

    // Restore original setting
    phoneScraperService.maxPagesPerSource = originalMaxPages;

    res.json({
      status: "success",
      message: "Test scraping completed successfully",
      data: {
        rawCount: rawPhones.length,
        normalizedCount: normalizedPhones.length,
        samplePhones: normalizedPhones.slice(0, 5).map((phone) => ({
          name: phone.name,
          brand: phone.brand,
          price: phone.price,
          source: phone.source,
        })),
        sources: [...new Set(rawPhones.map((p) => p.source))],
      },
    });
  } catch (error) {
    console.error("Error in test scraping:", error);
    res.status(500).json({
      status: "error",
      message: "Test scraping failed",
      error: error.message,
      details: "This might be due to network issues or anti-bot measures",
    });
  }
});

/**
 * Get database statistics
 */
router.get("/database/stats", async (req, res) => {
  try {
    const prisma = req.prisma;

    // Get total phones count
    const totalPhones = await prisma.product.count();

    // Get phones by brand
    const phonesByBrand = await prisma.product.groupBy({
      by: ["brand"],
      _count: true,
      orderBy: {
        _count: {
          brand: "desc",
        },
      },
    });

    // Get price statistics
    const priceStats = await prisma.product.aggregate({
      _min: { price: true },
      _max: { price: true },
      _avg: { price: true },
    });

    // Get latest updated phones
    const recentlyUpdated = await prisma.product.findMany({
      select: {
        name: true,
        brand: true,
        price: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
    });

    res.json({
      status: "success",
      data: {
        totalPhones,
        phonesByBrand: phonesByBrand.map((item) => ({
          brand: item.brand,
          count: item._count,
        })),
        priceStats: {
          minimum: priceStats._min.price,
          maximum: priceStats._max.price,
          average: Math.round(priceStats._avg.price || 0),
        },
        recentlyUpdated,
      },
    });
  } catch (error) {
    console.error("Error getting database stats:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to get database statistics",
      error: error.message,
    });
  }
});

module.exports = router;
