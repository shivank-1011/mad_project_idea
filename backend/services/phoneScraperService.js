const puppeteer = require("puppeteer");
const axios = require("axios");
const cheerio = require("cheerio");
const UserAgent = require("user-agents");
const comprehensivePhoneDataService = require("./comprehensivePhoneDataService");

class PhoneScraperService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 24 * 60 * 60 * 1000;
    this.requestDelay = 3000;
    this.maxRetries = 3;
    this.maxPagesPerSource = 5;
  }

  async scrapeAllPhones() {
    console.log("🚀 Starting comprehensive phone scraping...");

    try {
      console.log("� Checking comprehensive phone database...");
      const comprehensivePhones =
        await comprehensivePhoneDataService.generateComprehensivePhoneData();

      if (comprehensivePhones && comprehensivePhones.length > 0) {
        console.log(
          `✅ Comprehensive DB: Found ${comprehensivePhones.length} phones`
        );
        return comprehensivePhones;
      }

      console.log("🔄 Falling back to web scraping...");
      const [flipkartPhones, amazonPhones] = await Promise.allSettled([
        this.scrapeFlipkartPhones(),
        this.scrapeAmazonPhones(),
      ]);

      let allPhones = [];

      if (flipkartPhones.status === "fulfilled") {
        console.log(`✅ Flipkart: Found ${flipkartPhones.value.length} phones`);
        allPhones = allPhones.concat(flipkartPhones.value);
      } else {
        console.error("❌ Flipkart scraping failed:", flipkartPhones.reason);
      }

      if (amazonPhones.status === "fulfilled") {
        console.log(`✅ Amazon: Found ${amazonPhones.value.length} phones`);
        allPhones = allPhones.concat(amazonPhones.value);
      } else {
        console.error("❌ Amazon scraping failed:", amazonPhones.reason);
      }

      const uniquePhones = this.removeDuplicates(allPhones);
      console.log(`📱 Total unique phones found: ${uniquePhones.length}`);

      return uniquePhones;
    } catch (error) {
      console.error("💥 Error in scrapeAllPhones:", error);
      throw error;
    }
  }

  async scrapeFlipkartPhones() {
    console.log("🛒 Scraping phones from Flipkart...");

    const phones = [];
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080",
        ],
      });

      const page = await browser.newPage();

      await page.setUserAgent(new UserAgent().toString());
      await page.setViewport({ width: 1920, height: 1080 });

      const flipkartUrl =
        "https://www.flipkart.com/mobiles/pr?sid=tyy%2C4io&p%5B%5D=facets.brand%255B%255D%3DSamsung&p%5B%5D=facets.brand%255B%255D%3DAPPLE&p%5B%5D=facets.brand%255B%255D%3DNothing&p%5B%5D=facets.brand%255B%255D%3DOnePlus&p%5B%5D=facets.brand%255B%255D%3Dvivo&p%5B%5D=facets.brand%255B%255D%3DXIAOMI&p%5B%5D=facets.brand%255B%255D%3Drealme&p%5B%5D=facets.brand%255B%255D%3DOPPO&otracker=categorytree";

      console.log(`🌐 Navigating to Flipkart: ${flipkartUrl}`);
      await page.goto(flipkartUrl, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });

      try {
        await page.waitForSelector('button[class*="cancel"]', {
          timeout: 5000,
        });
        await page.click('button[class*="cancel"]');
        console.log("✅ Closed Flipkart login popup");
      } catch (e) {
        console.log("ℹ️ No login popup found");
      }

      for (let pageNum = 1; pageNum <= this.maxPagesPerSource; pageNum++) {
        console.log(`📄 Scraping Flipkart page ${pageNum}...`);

        try {
          await page.waitForSelector("[data-id]", { timeout: 10000 });

          const pagePhones = await page.evaluate(() => {
            const phoneElements = document.querySelectorAll("[data-id]");
            const phones = [];

            phoneElements.forEach((element, index) => {
              if (index >= 20) return;

              try {
                const nameElement = element.querySelector(
                  'div[class*="KzDlHZ"], a[class*="wjcEIp"]'
                );
                const priceElement = element.querySelector(
                  'div[class*="Nx9bqj"], div[class*="_1_WHN1"]'
                );
                const imageElement = element.querySelector("img");
                const ratingElement = element.querySelector(
                  'div[class*="XQDdHH"]'
                );
                const linkElement = element.querySelector("a");

                if (nameElement && priceElement) {
                  const name = nameElement.textContent.trim();
                  const priceText = priceElement.textContent.trim();

                  const brand = name.split(" ")[0];

                  const priceMatch = priceText.match(/₹([\d,]+)/);
                  const price = priceMatch
                    ? parseInt(priceMatch[1].replace(/,/g, ""))
                    : 0;

                  const ratingText = ratingElement
                    ? ratingElement.textContent.trim()
                    : "4.0";
                  const rating = parseFloat(ratingText) || 4.0;

                  const imageUrl = imageElement ? imageElement.src : "";

                  const productLink = linkElement
                    ? "https://www.flipkart.com" +
                      linkElement.getAttribute("href")
                    : "";

                  if (price > 1000 && name.length > 5) {
                    phones.push({
                      name,
                      brand,
                      price,
                      rating,
                      imageUrl,
                      affiliateLink: productLink,
                      source: "flipkart",
                      specs: {
                        ram: this.extractRAM(name),
                        storage: this.extractStorage(name),
                        display: "TBD",
                        camera: "TBD",
                        battery: "TBD",
                      },
                    });
                  }
                }
              } catch (e) {
                console.log("Error processing phone element:", e.message);
              }
            });

            return phones;
          });

          phones.push(...pagePhones);
          console.log(
            `📱 Found ${pagePhones.length} phones on page ${pageNum}`
          );

          if (pageNum < this.maxPagesPerSource) {
            const nextButton = await page.$('a[class*="ge2uzL"]:last-child');
            if (nextButton) {
              await Promise.all([
                page.waitForNavigation({ waitUntil: "networkidle2" }),
                nextButton.click(),
              ]);
              await this.delay(this.requestDelay);
            } else {
              console.log("🏁 No more pages available on Flipkart");
              break;
            }
          }
        } catch (error) {
          console.error(
            `❌ Error scraping Flipkart page ${pageNum}:`,
            error.message
          );
          break;
        }
      }
    } catch (error) {
      console.error("💥 Flipkart scraping error:", error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return phones;
  }

  async scrapeAmazonPhones() {
    console.log("🛒 Scraping phones from Amazon...");

    const phones = [];
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080",
        ],
      });

      const page = await browser.newPage();

      await page.setUserAgent(new UserAgent().toString());
      await page.setViewport({ width: 1920, height: 1080 });

      const brands = [
        "Samsung",
        "Apple",
        "OnePlus",
        "Xiaomi",
        "Vivo",
        "Realme",
        "Nothing",
        "Oppo",
      ];

      for (const brand of brands) {
        console.log(`🔍 Searching Amazon for ${brand} phones...`);

        try {
          const searchUrl = `https://www.amazon.in/s?k=${brand}+mobile&ref=sr_pg_1`;
          await page.goto(searchUrl, {
            waitUntil: "networkidle2",
            timeout: 30000,
          });

          await page.waitForSelector(
            '[data-component-type="s-search-result"]',
            { timeout: 10000 }
          );

          const brandPhones = await page.evaluate((brandName) => {
            const phoneElements = document.querySelectorAll(
              '[data-component-type="s-search-result"]'
            );
            const phones = [];

            phoneElements.forEach((element, index) => {
              if (index >= 15) return;

              try {
                const nameElement = element.querySelector(
                  'h2 a span, [data-cy="title-recipe-label"]'
                );
                const priceElement = element.querySelector(
                  ".a-price .a-offscreen"
                );
                const imageElement = element.querySelector(".s-image");
                const ratingElement = element.querySelector(".a-icon-alt");
                const linkElement = element.querySelector("h2 a");

                if (nameElement && priceElement) {
                  const name = nameElement.textContent.trim();
                  const priceText = priceElement.textContent.trim();

                  if (
                    !name.toLowerCase().includes("mobile") &&
                    !name.toLowerCase().includes("phone") &&
                    !name.toLowerCase().includes("smartphone")
                  ) {
                    return;
                  }

                  const brand = name.split(" ")[0] || brandName;

                  const priceMatch = priceText.match(/₹([\d,]+)/);
                  const price = priceMatch
                    ? parseInt(priceMatch[1].replace(/,/g, ""))
                    : 0;

                  const ratingText = ratingElement
                    ? ratingElement.textContent
                    : "";
                  const ratingMatch = ratingText.match(/([\d.]+) out of/);
                  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 4.0;

                  const imageUrl = imageElement ? imageElement.src : "";

                  const productLink = linkElement
                    ? "https://www.amazon.in" + linkElement.getAttribute("href")
                    : "";

                  if (price > 1000 && name.length > 5) {
                    phones.push({
                      name,
                      brand,
                      price,
                      rating,
                      imageUrl,
                      affiliateLink: productLink,
                      source: "amazon",
                      specs: {
                        ram: this.extractRAM(name),
                        storage: this.extractStorage(name),
                        display: "TBD",
                        camera: "TBD",
                        battery: "TBD",
                      },
                    });
                  }
                }
              } catch (e) {
                console.log(
                  "Error processing Amazon phone element:",
                  e.message
                );
              }
            });

            return phones;
          }, brand);

          phones.push(...brandPhones);
          console.log(
            `📱 Found ${brandPhones.length} ${brand} phones on Amazon`
          );

          await this.delay(this.requestDelay);
        } catch (error) {
          console.error(
            `❌ Error searching Amazon for ${brand}:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error("💥 Amazon scraping error:", error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }

    return phones;
  }

  extractRAM(name) {
    const ramMatch = name.match(/(\d+)\s*GB\s*RAM|(\d+)GB(?=.*RAM)/i);
    return ramMatch ? `${ramMatch[1] || ramMatch[2]}GB` : "TBD";
  }

  extractStorage(name) {
    const storageMatch = name.match(/(\d+)\s*GB(?!\s*RAM)|(\d+)TB/i);
    if (storageMatch) {
      const value = storageMatch[1] || storageMatch[2];
      const unit = storageMatch[0].includes("TB") ? "TB" : "GB";
      return `${value}${unit}`;
    }
    return "TBD";
  }

  removeDuplicates(phones) {
    const uniquePhones = [];
    const seen = new Set();

    phones.forEach((phone) => {
      const normalizedName = phone.name
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[^\w\s]/g, "")
        .trim();

      const key = `${phone.brand.toLowerCase()}_${normalizedName}`;

      if (!seen.has(key)) {
        seen.add(key);
        uniquePhones.push(phone);
      }
    });

    return uniquePhones;
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getCachedData(key) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(key);
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}

module.exports = new PhoneScraperService();
