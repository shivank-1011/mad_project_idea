class PhoneDataNormalizer {
  constructor() {
    // Brand name mappings to standardize variations
    this.brandMappings = {
      APPLE: "Apple",
      apple: "Apple",
      iPhone: "Apple",
      samsung: "Samsung",
      SAMSUNG: "Samsung",
      oneplus: "OnePlus",
      ONEPLUS: "OnePlus",
      OnePlus: "OnePlus",
      xiaomi: "Xiaomi",
      XIAOMI: "Xiaomi",
      MI: "Xiaomi",
      Redmi: "Xiaomi",
      REDMI: "Xiaomi",
      vivo: "Vivo",
      VIVO: "Vivo",
      realme: "Realme",
      REALME: "Realme",
      oppo: "Oppo",
      OPPO: "Oppo",
      nothing: "Nothing",
      NOTHING: "Nothing",
      Nothing: "Nothing",
      Motorola: "Motorola",
      MOTOROLA: "Motorola",
      Google: "Google",
      GOOGLE: "Google",
      Pixel: "Google",
    };

    // Common words to remove from phone names for better normalization
    this.stopWords = [
      "5G",
      "4G",
      "Smartphone",
      "Mobile",
      "Phone",
      "Dual SIM",
      "Triple Camera",
      "Quad Camera",
      "AI Camera",
      "Pro Camera",
      "Fast Charging",
      "Wireless Charging",
      "Water Resistant",
      "Fingerprint",
      "Face Unlock",
      "Android",
      "iOS",
    ];

    // Price ranges for validation
    this.priceRanges = {
      budget: { min: 5000, max: 15000 },
      mid: { min: 15000, max: 40000 },
      premium: { min: 40000, max: 80000 },
      flagship: { min: 80000, max: 200000 },
    };
  }

  /**
   * Normalize an array of phone data from different sources
   */
  async normalizePhones(phones) {
    console.log(`🔧 Normalizing ${phones.length} phone entries...`);

    const normalized = [];
    const duplicateTracker = new Map();

    for (const phone of phones) {
      try {
        const normalizedPhone = await this.normalizePhone(phone);

        if (normalizedPhone && this.isValidPhone(normalizedPhone)) {
          // Check for duplicates using normalized name + brand
          const key = `${normalizedPhone.brand}_${normalizedPhone.normalizedName}`;

          if (!duplicateTracker.has(key)) {
            duplicateTracker.set(key, true);
            normalized.push(normalizedPhone);
          } else {
            console.log(`🔄 Duplicate removed: ${normalizedPhone.name}`);
          }
        }
      } catch (error) {
        console.error(
          `❌ Error normalizing phone ${phone.name}:`,
          error.message
        );
      }
    }

    console.log(`✅ Normalization complete: ${normalized.length} valid phones`);
    return normalized;
  }

  /**
   * Normalize a single phone object
   */
  async normalizePhone(phone) {
    if (!phone || !phone.name) {
      return null;
    }

    // Normalize brand name
    const normalizedBrand = this.normalizeBrand(
      phone.brand || this.extractBrandFromName(phone.name)
    );

    // Clean and normalize phone name
    const cleanName = this.cleanPhoneName(phone.name);
    const normalizedName = this.normalizePhoneName(cleanName);

    // Extract and normalize specifications
    const specs = await this.normalizeSpecs(phone.name, phone.specs || {});

    // Normalize price
    const normalizedPrice = this.normalizePrice(phone.price);

    // Normalize rating
    const normalizedRating = this.normalizeRating(phone.rating);

    // Validate and clean image URL
    const cleanImageUrl = this.validateImageUrl(phone.imageUrl);

    // Generate price category
    const priceCategory = this.getPriceCategory(normalizedPrice);

    return {
      name: cleanName,
      normalizedName,
      brand: normalizedBrand,
      specs,
      price: normalizedPrice,
      priceCategory,
      rating: normalizedRating,
      imageUrl: cleanImageUrl,
      affiliateLink: phone.affiliateLink || "",
      source: phone.source || "unknown",
      lastUpdated: new Date(),
      // Additional computed fields
      displayName: `${normalizedBrand} ${normalizedName}`,
      searchKeywords: this.generateSearchKeywords(
        normalizedBrand,
        normalizedName,
        specs
      ),
    };
  }

  /**
   * Clean phone name by removing unwanted characters and normalizing format
   */
  cleanPhoneName(name) {
    if (!name) return "";

    return name
      .trim()
      .replace(/\s+/g, " ") // Multiple spaces to single space
      .replace(/[^\w\s\-\+\(\)]/g, " ") // Remove special characters except common ones
      .replace(/\b(mobile|smartphone|phone)\b/gi, "") // Remove mobile/smartphone/phone words
      .trim();
  }

  /**
   * Normalize phone name for better matching and deduplication
   */
  normalizePhoneName(name) {
    if (!name) return "";

    return name.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "");
  }

  /**
   * Normalize brand name using mappings
   */
  normalizeBrand(brand) {
    if (!brand) return "Unknown";

    const trimmed = brand.trim();
    return this.brandMappings[trimmed] || this.capitalizeFirst(trimmed);
  }

  /**
   * Extract brand from phone name if not provided
   */
  extractBrandFromName(name) {
    if (!name) return "Unknown";

    const firstWord = name.trim().split(" ")[0];
    return this.brandMappings[firstWord] || firstWord;
  }

  /**
   * Normalize phone specifications
   */
  async normalizeSpecs(name, specs) {
    const normalized = {
      ram: this.extractRAM(name) || specs.ram || "Not specified",
      storage: this.extractStorage(name) || specs.storage || "Not specified",
      display: this.extractDisplay(name) || specs.display || "Not specified",
      camera: this.extractCamera(name) || specs.camera || "Not specified",
      battery: this.extractBattery(name) || specs.battery || "Not specified",
      processor:
        this.extractProcessor(name) || specs.processor || "Not specified",
      os: this.extractOS(name) || specs.os || "Not specified",
    };

    return normalized;
  }

  /**
   * Extract RAM information from name
   */
  extractRAM(name) {
    const ramMatches = [
      /(\d+)\s*GB\s*RAM/gi,
      /(\d+)GB\s*RAM/gi,
      /RAM\s*(\d+)GB/gi,
      /(\d+)\s*GB(?=.*RAM)/gi,
    ];

    for (const regex of ramMatches) {
      const match = name.match(regex);
      if (match) {
        return `${match[1]}GB`;
      }
    }
    return null;
  }

  /**
   * Extract Storage information from name
   */
  extractStorage(name) {
    const storageMatches = [
      /(\d+)\s*GB(?!\s*RAM)/gi,
      /(\d+)\s*TB/gi,
      /(\d+)GB(?!\s*RAM)/gi,
      /Storage\s*(\d+)GB/gi,
    ];

    for (const regex of storageMatches) {
      const match = name.match(regex);
      if (match) {
        const value = match[1];
        const unit = name.includes("TB") ? "TB" : "GB";
        return `${value}${unit}`;
      }
    }
    return null;
  }

  /**
   * Extract Display information from name
   */
  extractDisplay(name) {
    const displayMatches = [
      /(\d+\.?\d*)\s*inch/gi,
      /(\d+\.?\d*)"/gi,
      /(\d+\.?\d*)\s*″/gi,
    ];

    for (const regex of displayMatches) {
      const match = name.match(regex);
      if (match) {
        return `${match[1]} inch`;
      }
    }
    return null;
  }

  /**
   * Extract Camera information from name
   */
  extractCamera(name) {
    const cameraMatches = [
      /(\d+)\s*MP/gi,
      /(\d+)MP/gi,
      /(Triple|Quad|Dual)\s*Camera/gi,
      /(\d+)\+(\d+)MP/gi,
    ];

    for (const regex of cameraMatches) {
      const match = name.match(regex);
      if (match) {
        return match[0];
      }
    }
    return null;
  }

  /**
   * Extract Battery information from name
   */
  extractBattery(name) {
    const batteryMatches = [
      /(\d+)\s*mAh/gi,
      /(\d+)mAh/gi,
      /Battery\s*(\d+)mAh/gi,
    ];

    for (const regex of batteryMatches) {
      const match = name.match(regex);
      if (match) {
        return `${match[1]}mAh`;
      }
    }
    return null;
  }

  /**
   * Extract Processor information from name
   */
  extractProcessor(name) {
    const processors = [
      "Snapdragon",
      "MediaTek",
      "Exynos",
      "Kirin",
      "A14",
      "A15",
      "A16",
      "A17",
      "Bionic",
      "Dimensity",
      "Unisoc",
      "Helio",
    ];

    for (const processor of processors) {
      if (name.toLowerCase().includes(processor.toLowerCase())) {
        const match = name.match(new RegExp(`${processor}\\s*(\\d+)`, "gi"));
        return match ? match[0] : processor;
      }
    }
    return null;
  }

  /**
   * Extract OS information from name
   */
  extractOS(name) {
    if (
      name.toLowerCase().includes("iphone") ||
      name.toLowerCase().includes("apple")
    ) {
      return "iOS";
    }
    if (name.toLowerCase().includes("android")) {
      return "Android";
    }
    return null;
  }

  /**
   * Normalize price (ensure it's a valid number)
   */
  normalizePrice(price) {
    if (typeof price === "string") {
      const numericPrice = parseInt(price.replace(/[^\d]/g, ""));
      return isNaN(numericPrice) ? 0 : numericPrice;
    }
    return typeof price === "number" && price > 0 ? price : 0;
  }

  /**
   * Normalize rating (ensure it's between 0 and 5)
   */
  normalizeRating(rating) {
    const numericRating = parseFloat(rating);
    if (isNaN(numericRating)) return 4.0;
    return Math.max(0, Math.min(5, numericRating));
  }

  /**
   * Validate and clean image URL
   */
  validateImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string") return "";

    try {
      new URL(imageUrl);
      return imageUrl;
    } catch {
      return "";
    }
  }

  /**
   * Get price category based on price ranges
   */
  getPriceCategory(price) {
    for (const [category, range] of Object.entries(this.priceRanges)) {
      if (price >= range.min && price <= range.max) {
        return category;
      }
    }
    return price > 200000 ? "ultra-premium" : "unknown";
  }

  /**
   * Generate search keywords for better discoverability
   */
  generateSearchKeywords(brand, name, specs) {
    const keywords = [
      brand.toLowerCase(),
      name.toLowerCase(),
      specs.ram && specs.ram !== "Not specified" ? specs.ram.toLowerCase() : "",
      specs.storage && specs.storage !== "Not specified"
        ? specs.storage.toLowerCase()
        : "",
      specs.camera && specs.camera !== "Not specified"
        ? specs.camera.toLowerCase()
        : "",
    ].filter(Boolean);

    return keywords.join(" ");
  }

  /**
   * Validate if phone data meets minimum requirements
   */
  isValidPhone(phone) {
    return (
      phone &&
      phone.name &&
      phone.name.length > 2 &&
      phone.brand &&
      phone.brand !== "Unknown" &&
      phone.price > 1000 &&
      phone.price < 500000 &&
      phone.rating >= 0 &&
      phone.rating <= 5
    );
  }

  /**
   * Capitalize first letter of each word
   */
  capitalizeFirst(str) {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
}

module.exports = new PhoneDataNormalizer();
