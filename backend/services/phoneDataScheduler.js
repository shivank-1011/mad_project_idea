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


    this.scheduleJobs();
  }


  scheduleJobs() {

    cron.schedule("0 2 * * *", async () => {
      console.log("🕐 Starting scheduled daily phone data update...");
      await this.performFullScrape();
    });


    cron.schedule("0 */6 * * *", async () => {
      console.log("🕐 Starting scheduled price update...");
      await this.performPriceUpdate();
    });


    cron.schedule("0 3 * * 0", async () => {
      console.log("🕐 Starting scheduled weekly cleanup...");
      await this.performCleanup();
    });






  }


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


      const rawPhones = await phoneScraperService.scrapeAllPhones();
      console.log(`📱 Scraped ${rawPhones.length} phones from all sources`);


      const normalizedPhones = await phoneDataNormalizer.normalizePhones(
        rawPhones
      );
      console.log(`🔧 Normalized to ${normalizedPhones.length} valid phones`);


      const result = await this.savePhonesToDatabase(normalizedPhones);


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


  async performPriceUpdate() {
    if (this.isRunning) {
      console.log("⚠️ Job already running, skipping price update...");
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      console.log("💰 Starting price update for existing phones...");


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
      const batchSize = 10;

      for (let i = 0; i < existingPhones.length; i += batchSize) {
        const batch = existingPhones.slice(i, i + batchSize);

        await Promise.all(
          batch.map(async (phone) => {
            try {


              const priceVariation = 1 + (Math.random() - 0.5) * 0.1;
              const newPrice = Math.round(phone.price * priceVariation);

              await this.prisma.product.update({
                where: { id: phone.id },
                data: {
                  price: newPrice,
                  updatedAt: new Date(),
                },
              });


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


  async performCleanup() {
    const startTime = Date.now();

    try {
      console.log("🧹 Starting weekly data cleanup...");


      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedPriceHistory = await this.prisma.priceHistory.deleteMany({
        where: {
          date: {
            lt: thirtyDaysAgo,
          },
        },
      });


      const deletedPhones = await this.prisma.product.deleteMany({
        where: {
          OR: [
            { price: { lte: 0 } },
            { name: { equals: "" } },
            { brand: { equals: "" } },
            {
              updatedAt: {
                lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
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


  async savePhonesToDatabase(phones) {
    const results = {
      added: 0,
      updated: 0,
      skipped: 0,
    };

    console.log(`💾 Saving ${phones.length} phones to database...`);

    for (const phone of phones) {
      try {

        const existingPhone = await this.prisma.product.findFirst({
          where: {
            name: phone.name,
            brand: phone.brand,
          },
        });

        if (existingPhone) {

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


  async triggerFullScrape() {
    console.log("🔄 Manual full scrape triggered...");
    await this.performFullScrape();
  }


  async triggerPriceUpdate() {
    console.log("🔄 Manual price update triggered...");
    await this.performPriceUpdate();
  }


  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      nextRun: this.nextRun,
    };
  }


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


  async shutdown() {
    console.log("🛑 Shutting down phone data scheduler...");
    await this.prisma.$disconnect();
  }
}

module.exports = new PhoneDataScheduler();
