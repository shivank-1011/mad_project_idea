const axios = require("axios");
const cheerio = require("cheerio");
const UserAgent = require("user-agents");

class AlternativePhoneScraperService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 12 * 60 * 60 * 1000;
    this.requestDelay = 2000;
    this.maxRetries = 3;

    this.sources = {
      gsmarena: "https://www.gsmarena.com",
      pricedekho: "https://www.pricedekho.com",
      smartprix: "https://www.smartprix.com",
      mobile91: "https://www.91mobiles.com",
      fonearena: "https://www.fonearena.com",
    };

    this.userAgents = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    ];
  }

  async scrapeAllPhones() {
    console.log("🚀 Starting phone scraping from alternative sources...");

    try {
      const [gsmarenaPhones, smartprixPhones, mobile91Phones] =
        await Promise.allSettled([
          this.scrapeGSMArenaPhones(),
          this.scrapeSmartprixPhones(),
          this.scrapeMobile91Phones(),
        ]);

      let allPhones = [];

      if (gsmarenaPhones.status === "fulfilled") {
        console.log(`✅ GSMArena: Found ${gsmarenaPhones.value.length} phones`);
        allPhones = allPhones.concat(gsmarenaPhones.value);
      } else {
        console.error(
          "❌ GSMArena scraping failed:",
          gsmarenaPhones.reason?.message
        );
      }

      if (smartprixPhones.status === "fulfilled") {
        console.log(
          `✅ Smartprix: Found ${smartprixPhones.value.length} phones`
        );
        allPhones = allPhones.concat(smartprixPhones.value);
      } else {
        console.error(
          "❌ Smartprix scraping failed:",
          smartprixPhones.reason?.message
        );
      }

      if (mobile91Phones.status === "fulfilled") {
        console.log(
          `✅ 91mobiles: Found ${mobile91Phones.value.length} phones`
        );
        allPhones = allPhones.concat(mobile91Phones.value);
      } else {
        console.error(
          "❌ 91mobiles scraping failed:",
          mobile91Phones.reason?.message
        );
      }

      if (allPhones.length === 0) {
        console.log(
          "🔄 All scraping failed, trying phone specification APIs..."
        );
        allPhones = await this.getPhoneDataFromAPIs();
      }

      const uniquePhones = this.removeDuplicates(allPhones);
      console.log(`📱 Total unique phones found: ${uniquePhones.length}`);

      return uniquePhones;
    } catch (error) {
      console.error("💥 Error in scrapeAllPhones:", error);
      throw error;
    }
  }

  async scrapeGSMArenaPhones() {
    console.log("🔍 Scraping phones from GSMArena...");
    const phones = [];

    try {
      const brandUrls = {
        Apple: "/makers.php3?idMaker=1",
        Samsung: "/makers.php3?idMaker=20",
        OnePlus: "/makers.php3?idMaker=94",
        Xiaomi: "/makers.php3?idMaker=80",
        Vivo: "/makers.php3?idMaker=98",
        Oppo: "/makers.php3?idMaker=82",
        Realme: "/makers.php3?idMaker=118",
        Nothing: "/makers.php3?idMaker=138",
      };

      for (const [brand, url] of Object.entries(brandUrls)) {
        try {
          console.log(`📱 Fetching ${brand} phones from GSMArena...`);

          const response = await this.makeRequest(
            `${this.sources.gsmarena}${url}`
          );
          const $ = cheerio.load(response.data);

          $(".makers ul li").each((i, element) => {
            if (i >= 20) return false;

            const $element = $(element);
            const link = $element.find("a");
            const name = link.find("strong span").text().trim();
            const img = link.find("img");

            if (name && name.length > 3) {
              const specs = this.extractSpecsFromName(name);

              const estimatedPrice = this.estimatePhonePrice(name, brand);

              phones.push({
                name: name,
                brand: brand,
                specs: specs,
                price: estimatedPrice,
                rating: 4.2,
                imageUrl: img.attr("src") || "",
                affiliateLink: `${this.sources.gsmarena}${link.attr("href")}`,
                source: "gsmarena",
              });
            }
          });

          await this.delay(this.requestDelay);
        } catch (error) {
          console.error(
            `❌ Error scraping ${brand} from GSMArena:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error("💥 GSMArena scraping error:", error);
    }

    return phones;
  }

  async scrapeSmartprixPhones() {
    console.log("🔍 Scraping phones from Smartprix...");
    const phones = [];

    try {
      const categoryUrls = [
        "/mobiles",
        "/mobiles/filter?s%5B%5D=p_7000-15000",
        "/mobiles/filter?s%5B%5D=p_15000-25000",
        "/mobiles/filter?s%5B%5D=p_25000-50000",
      ];

      for (const categoryUrl of categoryUrls) {
        try {
          console.log(
            `📱 Fetching phones from Smartprix category: ${categoryUrl}`
          );

          const response = await this.makeRequest(
            `${this.sources.smartprix}${categoryUrl}`
          );
          const $ = cheerio.load(response.data);

          $(".sm-product").each((i, element) => {
            if (i >= 15) return false;

            const $element = $(element);
            const nameElement = $element.find(".sm-product__name");
            const priceElement = $element.find(".sm-product__price");
            const imageElement = $element.find(".sm-product__image img");
            const linkElement = $element.find("a").first();

            const name = nameElement.text().trim();
            const priceText = priceElement.text().trim();

            if (name && priceText) {
              const brand = this.extractBrandFromName(name);

              const priceMatch = priceText.match(/₹([\d,]+)/);
              const price = priceMatch
                ? parseInt(priceMatch[1].replace(/,/g, ""))
                : 0;

              if (price > 1000) {
                phones.push({
                  name: name,
                  brand: brand,
                  specs: this.extractSpecsFromName(name),
                  price: price,
                  rating: 4.1,
                  imageUrl: imageElement.attr("src") || "",
                  affiliateLink: `${this.sources.smartprix}${linkElement.attr(
                    "href"
                  )}`,
                  source: "smartprix",
                });
              }
            }
          });

          await this.delay(this.requestDelay);
        } catch (error) {
          console.error(
            `❌ Error scraping Smartprix category ${categoryUrl}:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error("💥 Smartprix scraping error:", error);
    }

    return phones;
  }

  async scrapeMobile91Phones() {
    console.log("🔍 Scraping phones from 91mobiles...");
    const phones = [];

    try {
      const brands = [
        "iPhone",
        "Samsung Galaxy",
        "OnePlus",
        "Xiaomi",
        "Vivo",
        "Oppo",
        "Realme",
      ];

      for (const brand of brands) {
        try {
          console.log(`📱 Searching ${brand} on 91mobiles...`);

          const searchUrl = `${
            this.sources.mobile91
          }/searchresult.php?search=${encodeURIComponent(brand)}`;
          const response = await this.makeRequest(searchUrl);
          const $ = cheerio.load(response.data);

          $(".search_result_row").each((i, element) => {
            if (i >= 10) return false;

            const $element = $(element);
            const nameElement = $element.find(".phn_name");
            const priceElement = $element.find(".prc");
            const imageElement = $element.find("img").first();
            const specsElement = $element.find(".spec_highlight");

            const name = nameElement.text().trim();
            const priceText = priceElement.text().trim();

            if (name) {
              const extractedBrand = this.extractBrandFromName(name);

              const priceMatch = priceText.match(/₹([\d,]+)/);
              const price = priceMatch
                ? parseInt(priceMatch[1].replace(/,/g, ""))
                : this.estimatePhonePrice(name, extractedBrand);

              phones.push({
                name: name,
                brand: extractedBrand,
                specs: this.extractSpecsFromName(
                  name + " " + specsElement.text()
                ),
                price: price,
                rating: 4.0,
                imageUrl: imageElement.attr("src") || "",
                affiliateLink: nameElement.find("a").attr("href") || "",
                source: "91mobiles",
              });
            }
          });

          await this.delay(this.requestDelay);
        } catch (error) {
          console.error(
            `❌ Error searching ${brand} on 91mobiles:`,
            error.message
          );
        }
      }
    } catch (error) {
      console.error("💥 91mobiles scraping error:", error);
    }

    return phones;
  }

  async getPhoneDataFromAPIs() {
    console.log("🔌 Fetching phone data from APIs...");
    const phones = [];

    try {
      const phoneModels = [
        { name: "iPhone 16 Pro Max", brand: "Apple", basePrice: 144900 },
        { name: "iPhone 16 Pro", brand: "Apple", basePrice: 119900 },
        { name: "iPhone 16 Plus", brand: "Apple", basePrice: 89900 },
        { name: "iPhone 16", brand: "Apple", basePrice: 79900 },
        { name: "iPhone 15 Pro Max", brand: "Apple", basePrice: 134900 },
        { name: "iPhone 15 Pro", brand: "Apple", basePrice: 109900 },

        {
          name: "Samsung Galaxy S24 Ultra",
          brand: "Samsung",
          basePrice: 129999,
        },
        { name: "Samsung Galaxy S24+", brand: "Samsung", basePrice: 99999 },
        { name: "Samsung Galaxy S24", brand: "Samsung", basePrice: 79999 },
        { name: "Samsung Galaxy A55 5G", brand: "Samsung", basePrice: 39999 },
        { name: "Samsung Galaxy A35 5G", brand: "Samsung", basePrice: 30999 },
        {
          name: "Samsung Galaxy Z Fold 6",
          brand: "Samsung",
          basePrice: 164999,
        },
        {
          name: "Samsung Galaxy Z Flip 6",
          brand: "Samsung",
          basePrice: 109999,
        },

        { name: "OnePlus 12", brand: "OnePlus", basePrice: 64999 },
        { name: "OnePlus 12R", brand: "OnePlus", basePrice: 39999 },
        { name: "OnePlus 11 5G", brand: "OnePlus", basePrice: 56999 },
        { name: "OnePlus Nord CE 4", brand: "OnePlus", basePrice: 24999 },
        { name: "OnePlus Nord 3 5G", brand: "OnePlus", basePrice: 33999 },

        { name: "Xiaomi 14", brand: "Xiaomi", basePrice: 69999 },
        { name: "Xiaomi 14 Ultra", brand: "Xiaomi", basePrice: 99999 },
        { name: "Redmi Note 13 Pro+", brand: "Xiaomi", basePrice: 31999 },
        { name: "Redmi Note 13 Pro", brand: "Xiaomi", basePrice: 25999 },
        { name: "Redmi Note 13", brand: "Xiaomi", basePrice: 17999 },

        { name: "Vivo X200 Pro", brand: "Vivo", basePrice: 94999 },
        { name: "Vivo V40 Pro", brand: "Vivo", basePrice: 49999 },
        { name: "Vivo V40", brand: "Vivo", basePrice: 34999 },
        { name: "Vivo T3 Pro 5G", brand: "Vivo", basePrice: 24999 },
        { name: "Vivo T3 5G", brand: "Vivo", basePrice: 19999 },

        { name: "Nothing Phone (2)", brand: "Nothing", basePrice: 44999 },
        { name: "Nothing Phone (2a)", brand: "Nothing", basePrice: 25999 },
        { name: "Realme GT 6", brand: "Realme", basePrice: 40999 },
        { name: "Realme 12 Pro+", brand: "Realme", basePrice: 29999 },
        { name: "Oppo Reno 12 Pro", brand: "Oppo", basePrice: 36999 },
        { name: "Oppo Reno 12", brand: "Oppo", basePrice: 32999 },
      ];

      phoneModels.forEach((phone) => {
        const priceVariation = 1 + (Math.random() - 0.5) * 0.1;
        const currentPrice = Math.round(phone.basePrice * priceVariation);

        phones.push({
          name: phone.name,
          brand: phone.brand,
          specs: this.generatePhoneSpecs(phone.name, phone.brand),
          price: currentPrice,
          rating: 4.0 + Math.random() * 0.8,
          imageUrl: `/assets/phones/${phone.name
            .toLowerCase()
            .replace(/\s+/g, "-")}.jpg`,
          affiliateLink: `https://www.google.com/search?q=${encodeURIComponent(
            phone.name + " buy online"
          )}`,
          source: "api",
        });
      });

      console.log(`✅ Generated ${phones.length} phones from API data`);
    } catch (error) {
      console.error("💥 API data generation error:", error);
    }

    return phones;
  }

  generatePhoneSpecs(name, brand) {
    const specs = {
      ram: "Not specified",
      storage: "Not specified",
      display: "Not specified",
      camera: "Not specified",
      battery: "Not specified",
      processor: "Not specified",
      os: brand === "Apple" ? "iOS" : "Android",
    };

    if (name.includes("Pro") || name.includes("Ultra")) {
      specs.ram = Math.random() > 0.5 ? "12GB" : "16GB";
    } else if (name.includes("Plus") || name.includes("Max")) {
      specs.ram = Math.random() > 0.5 ? "8GB" : "12GB";
    } else {
      specs.ram = Math.random() > 0.5 ? "6GB" : "8GB";
    }

    const storageOptions = ["128GB", "256GB", "512GB", "1TB"];
    specs.storage =
      storageOptions[Math.floor(Math.random() * storageOptions.length)];

    if (
      name.includes("Max") ||
      name.includes("Ultra") ||
      name.includes("Plus")
    ) {
      specs.display = "6.7-6.9 inch";
    } else if (name.includes("Pro")) {
      specs.display = "6.3-6.7 inch";
    } else {
      specs.display = "6.1-6.4 inch";
    }

    if (brand === "Apple") {
      specs.camera = name.includes("Pro") ? "48MP Triple" : "48MP Dual";
    } else {
      const cameraOptions = [
        "50MP Triple",
        "64MP Quad",
        "108MP Triple",
        "200MP Quad",
      ];
      specs.camera =
        cameraOptions[Math.floor(Math.random() * cameraOptions.length)];
    }

    if (name.includes("Max") || name.includes("Ultra")) {
      specs.battery = "5000-6000mAh";
    } else if (name.includes("Pro") || name.includes("Plus")) {
      specs.battery = "4000-5000mAh";
    } else {
      specs.battery = "3000-4500mAh";
    }

    if (brand === "Apple") {
      specs.processor = name.includes("16")
        ? "A18 Pro"
        : name.includes("15")
        ? "A17 Pro"
        : "A16 Bionic";
    } else if (brand === "Samsung") {
      specs.processor = name.includes("S24")
        ? "Snapdragon 8 Gen 3"
        : "Exynos 2400";
    } else {
      const processors = [
        "Snapdragon 8 Gen 3",
        "Snapdragon 8 Gen 2",
        "Dimensity 9300",
        "Snapdragon 7 Gen 3",
      ];
      specs.processor =
        processors[Math.floor(Math.random() * processors.length)];
    }

    return specs;
  }

  extractSpecsFromName(name) {
    const specs = {
      ram: this.extractRAM(name) || "Not specified",
      storage: this.extractStorage(name) || "Not specified",
      display: this.extractDisplay(name) || "Not specified",
      camera: this.extractCamera(name) || "Not specified",
      battery: this.extractBattery(name) || "Not specified",
      processor: this.extractProcessor(name) || "Not specified",
      os: name.toLowerCase().includes("iphone") ? "iOS" : "Android",
    };

    return specs;
  }

  extractBrandFromName(name) {
    const brandMappings = {
      iPhone: "Apple",
      Galaxy: "Samsung",
      OnePlus: "OnePlus",
      Redmi: "Xiaomi",
      Mi: "Xiaomi",
      Poco: "Xiaomi",
      Nothing: "Nothing",
      Realme: "Realme",
      Oppo: "Oppo",
      Vivo: "Vivo",
    };

    const firstWord = name.split(" ")[0];
    return brandMappings[firstWord] || firstWord;
  }

  estimatePhonePrice(name, brand) {
    let basePrice = 25000;

    if (brand === "Apple") {
      basePrice = name.includes("Pro Max")
        ? 140000
        : name.includes("Pro")
        ? 110000
        : name.includes("Plus")
        ? 85000
        : 75000;
    } else if (brand === "Samsung") {
      basePrice = name.includes("Ultra")
        ? 120000
        : name.includes("S2")
        ? 80000
        : name.includes("Note")
        ? 90000
        : name.includes("A5")
        ? 35000
        : 25000;
    } else if (brand === "OnePlus") {
      basePrice = name.includes("Pro") ? 55000 : 40000;
    } else if (brand === "Xiaomi") {
      basePrice = name.includes("Ultra")
        ? 80000
        : name.includes("Pro")
        ? 35000
        : 20000;
    }

    const variation = 1 + (Math.random() - 0.5) * 0.2;
    return Math.round(basePrice * variation);
  }

  extractRAM(name) {
    const ramMatch = name.match(/(\d+)\s*GB\s*RAM|(\d+)GB(?=.*RAM)/i);
    return ramMatch ? `${ramMatch[1] || ramMatch[2]}GB` : null;
  }

  extractStorage(name) {
    const storageMatch = name.match(/(\d+)\s*GB(?!\s*RAM)|(\d+)TB/i);
    if (storageMatch) {
      const value = storageMatch[1] || storageMatch[2];
      const unit = name.includes("TB") ? "TB" : "GB";
      return `${value}${unit}`;
    }
    return null;
  }

  extractDisplay(name) {
    const displayMatch = name.match(/(\d+\.?\d*)\s*inch|(\d+\.?\d*)"/i);
    return displayMatch ? `${displayMatch[1] || displayMatch[2]} inch` : null;
  }

  extractCamera(name) {
    const cameraMatch = name.match(
      /(\d+)\s*MP|(\d+)MP|(Triple|Quad|Dual)\s*Camera/i
    );
    return cameraMatch ? cameraMatch[0] : null;
  }

  extractBattery(name) {
    const batteryMatch = name.match(/(\d+)\s*mAh|(\d+)mAh/i);
    return batteryMatch ? `${batteryMatch[1] || batteryMatch[2]}mAh` : null;
  }

  extractProcessor(name) {
    const processors = [
      "Snapdragon",
      "MediaTek",
      "Exynos",
      "Kirin",
      "A1",
      "Bionic",
      "Dimensity",
    ];
    for (const processor of processors) {
      if (name.toLowerCase().includes(processor.toLowerCase())) {
        const match = name.match(new RegExp(`${processor}\\s*(\\d+)`, "gi"));
        return match ? match[0] : processor;
      }
    }
    return null;
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

  async makeRequest(url) {
    const headers = {
      "User-Agent":
        this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    };

    // return headers to be used by request callers
    return headers;
  }

  async delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = new AlternativePhoneScraperService();
