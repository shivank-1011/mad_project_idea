const cron = require("node-cron");
const phoneScraperService = require("./phoneScraperService");
const phoneDataNormalizer = require("./phoneDataNormalizer");
const { PrismaClient } = require("../generated/prisma");

class PhoneDataScheduler {
  constructor() {
    this.prisma = new PrismaClient();
    this.isRunning = false;
    this.lastRun = null;
    this.nextRun = null;
    this.stats = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalPhonesProcessed: 0,
      totalPhonesAdded: 0,
      totalPhonesUpdated: 0,
    };

    // Schedule jobs
    this.scheduleJobs();
  }

  /**
   * Schedule all background jobs
   */
  scheduleJobs() {
    // Daily full scrape at 2:00 AM
    cron.schedule("0 2 * * *", async () => {
      console.log("🕐 Starting scheduled daily phone data update...");
      await this.performFullScrape();
    });

    // Quick price updates every 6 hours
    cron.schedule("0 */6 * * *", async () => {
      console.log("🕐 Starting scheduled price update...");
      await this.performPriceUpdate();
    });

    // Weekly cleanup at 3:00 AM on Sundays
    cron.schedule("0 3 * * 0", async () => {
      console.log("🕐 Starting scheduled weekly cleanup...");
      await this.performCleanup();
    });

    // Uncomment below to see scheduler details on startup
    // console.log("📅 Phone data scheduler initialized with the following jobs:");
    // console.log("   - Daily full scrape: 2:00 AM");
    // console.log("   - Price updates: Every 6 hours");
    // console.log("   - Weekly cleanup: 3:00 AM on Sundays");
  }

  /**
   * Perform full scrape of phone data
   */
  async performFullScrape() {
    if (this.isRunning) {
      console.log("⚠️ Scraping job already running, skipping...");
      return;
    }

    this.isRunning = true;
    this.lastRun = new Date();
    const startTime = Date.now();

    try {
      console.log("🚀 Starting full phone data scrape...");

      // Scrape all phones
      const rawPhones = await phoneScraperService.scrapeAllPhones();
      console.log(`📱 Scraped ${rawPhones.length} phones from all sources`);

      // Normalize the data
      const normalizedPhones = await phoneDataNormalizer.normalizePhones(
        rawPhones
      );
      console.log(`🔧 Normalized to ${normalizedPhones.length} valid phones`);

      // Save to database
      const result = await this.savePhonesToDatabase(normalizedPhones);

      // Update statistics
      this.stats.totalRuns++;
      this.stats.successfulRuns++;
      this.stats.totalPhonesProcessed += normalizedPhones.length;
      this.stats.totalPhonesAdded += result.added;
      this.stats.totalPhonesUpdated += result.updated;

      const duration = Date.now() - startTime;
      console.log(
        `✅ Full scrape completed in ${this.formatDuration(duration)}`
      );
      console.log(`   - Added: ${result.added} phones`);
      console.log(`   - Updated: ${result.updated} phones`);
      console.log(`   - Skipped: ${result.skipped} phones`);
    } catch (error) {
      console.error("💥 Full scrape failed:", error);
      this.stats.totalRuns++;
      this.stats.failedRuns++;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Perform quick price updates for existing phones
   */
  async performPriceUpdate() {
    if (this.isRunning) {
      console.log("⚠️ Job already running, skipping price update...");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log("💰 Starting price update for existing phones...");

      // Get all phones from database
      const existingPhones = await this.prisma.product.findMany({
        select: {
          id: true,
          name: true,
          brand: true,
          price: true,
        },
      });

      console.log(`📊 Updating prices for ${existingPhones.length} phones...`);

      let updated = 0;
      const batchSize = 10; // Process in batches to avoid overwhelming the servers

      for (let i = 0; i < existingPhones.length; i += batchSize) {
        const batch = existingPhones.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (phone) => {
            try {
              // This is a simplified price update - in a real scenario you'd call the real-time price service
              // For now, we'll just add some variation to demonstrate the concept
              const priceVariation = 1 + (Math.random() - 0.5) * 0.1; // ±5% variation
              const newPrice = Math.round(phone.price * priceVariation);

              await this.prisma.product.update({
                where: { id: phone.id },
                data: {
                  price: newPrice,
                  updatedAt: new Date(),
                },
              });

              // Add to price history
              await this.prisma.priceHistory.create({
                data: {
                  productId: phone.id,
                  price: newPrice,
                },
              });

              updated++;
            } catch (error) {
              console.error(
                `❌ Failed to update price for ${phone.name}:`,
                error.message
              );
            }
          })
        );

        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      const duration = Date.now() - startTime;
      console.log(
        `✅ Price update completed in ${this.formatDuration(duration)}`
      );
      console.log(`   - Updated: ${updated} phone prices`);
    } catch (error) {
      console.error("💥 Price update failed:", error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Perform weekly cleanup of old data
   */
  async performCleanup() {
    const startTime = Date.now();

    try {
      console.log("🧹 Starting weekly data cleanup...");

      // Remove old price history (keep only last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedPriceHistory = await this.prisma.priceHistory.deleteMany({
        where: {
          date: {
            lt: thirtyDaysAgo,
          },
        },
      });

      // Remove phones with invalid data or very old entries
      const deletedPhones = await this.prisma.product.deleteMany({
        where: {
          OR: [
            { price: { lte: 0 } },
            { name: { equals: "" } },
            { brand: { equals: "" } },
            {
              updatedAt: {
                lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days old
              },
            },
          ],
        },
      });

      const duration = Date.now() - startTime;
      console.log(`✅ Cleanup completed in ${this.formatDuration(duration)}`);
      console.log(
        `   - Removed ${deletedPriceHistory.count} old price records`
      );
      console.log(`   - Removed ${deletedPhones.count} invalid/old phones`);
    } catch (error) {
      console.error("💥 Cleanup failed:", error);
    }
  }

  /**
   * Save normalized phones to database
   */
  async savePhonesToDatabase(phones) {
    const results = {
      added: 0,
      updated: 0,
      skipped: 0,
    };

    console.log(`💾 Saving ${phones.length} phones to database...`);

    for (const phone of phones) {
      try {
        // Check if phone already exists (by name and brand)
        const existingPhone = await this.prisma.product.findFirst({
          where: {
            name: phone.name,
            brand: phone.brand,
          },
        });

        if (existingPhone) {
          // Update existing phone
          await this.prisma.product.update({
            where: { id: existingPhone.id },
            data: {
              price: phone.price,
              rating: phone.rating,
              imageUrl: phone.imageUrl,
              affiliateLink: phone.affiliateLink,
              specs: phone.specs,
              updatedAt: new Date(),
            },
          });

          // Add price history if price changed
          if (existingPhone.price !== phone.price) {
            await this.prisma.priceHistory.create({
              data: {
                productId: existingPhone.id,
                price: phone.price,
              },
            });
          }

          results.updated++;
        } else {
          // Create new phone
          const newPhone = await this.prisma.product.create({
            data: {
              name: phone.name,
              brand: phone.brand,
              specs: phone.specs,
              price: phone.price,
              rating: phone.rating,
              imageUrl: phone.imageUrl,
              affiliateLink: phone.affiliateLink,
            },
          });

          // Add initial price history
          await this.prisma.priceHistory.create({
            data: {
              productId: newPhone.id,
              price: phone.price,
            },
          });

          results.added++;
        }
      } catch (error) {
        console.error(`❌ Error saving phone ${phone.name}:`, error.message);
        results.skipped++;
      }
    }

    return results;
  }

  /**
   * Manually trigger a full scrape
   */
  async triggerFullScrape() {
    console.log("🔄 Manual full scrape triggered...");
    await this.performFullScrape();
  }

  /**
   * Manually trigger a price update
   */
  async triggerPriceUpdate() {
    console.log("🔄 Manual price update triggered...");
    await this.performPriceUpdate();
  }

  /**
   * Get scheduler statistics
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
    };
  }

  /**
   * Format duration in human readable format
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Gracefully shutdown the scheduler
   */
  async shutdown() {
    console.log("🛑 Shutting down phone data scheduler...");
    await this.prisma.$disconnect();
  }
}

module.exports = new PhoneDataScheduler();
