const axios = require("axios");

class ImageService {
  constructor() {
    // Cache for storing fetched image URLs
    this.imageCache = new Map();

    // Rate limiting
    this.lastRequest = 0;
    this.requestDelay = 100; // 100ms delay between requests
  }

  /**
   * Get product image URL from web search
   */
  async getProductImageUrl(productName, brand) {
    try {
      const searchQuery = `${brand} ${productName}`;
      const cacheKey = `${brand}_${productName}`
        .toLowerCase()
        .replace(/\s+/g, "_");

      // Check cache first
      if (this.imageCache.has(cacheKey)) {
        console.log(`📷 Using cached image for ${searchQuery}`);
        return this.imageCache.get(cacheKey);
      }

      // Rate limiting
      const now = Date.now();
      if (now - this.lastRequest < this.requestDelay) {
        await this.sleep(this.requestDelay - (now - this.lastRequest));
      }
      this.lastRequest = Date.now();

      console.log(`🔍 Searching for image: ${searchQuery}`);

      // Try multiple image sources
      let imageUrl = await this.searchUnsplash(searchQuery);

      if (!imageUrl) {
        imageUrl = await this.searchPixabay(searchQuery);
      }

      if (!imageUrl) {
        imageUrl = await this.generateFallbackImage(productName, brand);
      }

      // Cache the result
      if (imageUrl) {
        this.imageCache.set(cacheKey, imageUrl);
        console.log(
          `✅ Found image for ${searchQuery}: ${imageUrl.substring(0, 50)}...`
        );
      }

      return imageUrl;
    } catch (error) {
      console.error(
        `💥 Error fetching image for ${brand} ${productName}:`,
        error.message
      );
      return this.generateFallbackImage(productName, brand);
    }
  }

  /**
   * Search Unsplash for product images
   */
  async searchUnsplash(query) {
    try {
      // Using Unsplash's public API with no auth required for basic search
      const cleanQuery = encodeURIComponent(query.replace(/\s+/g, "+"));
      const unsplashUrl = `https://source.unsplash.com/400x300/?${cleanQuery}`;

      // Test if the URL is accessible
      const response = await axios.head(unsplashUrl, {
        timeout: 5000,
        maxRedirects: 5,
      });

      if (response.status === 200) {
        return unsplashUrl;
      }
    } catch (error) {
      console.log(`⚠️ Unsplash search failed for "${query}":`, error.message);
    }
    return null;
  }

  /**
   * Search Pixabay for product images (requires API key for production)
   */
  async searchPixabay(query) {
    try {
      // For now, using a demo approach. In production, you'd need a Pixabay API key
      const cleanQuery = encodeURIComponent(query);

      // This is a placeholder - would need actual Pixabay API integration
      const pixabayUrl = `https://pixabay.com/api/?key=YOUR_API_KEY&q=${cleanQuery}&image_type=photo&per_page=3`;

      console.log(`ℹ️ Pixabay search would be: ${pixabayUrl}`);
      // For now, return null since we don't have API key
      return null;
    } catch (error) {
      console.log(`⚠️ Pixabay search failed for "${query}":`, error.message);
    }
    return null;
  }

  /**
   * Generate fallback image URLs using placeholder services
   */
  generateFallbackImage(productName, brand) {
    try {
      // Create a clean text for the placeholder
      const text = `${brand} ${productName}`.replace(/\s+/g, "+");

      // Use different placeholder services
      const placeholders = [
        `https://via.placeholder.com/400x300/2563eb/ffffff?text=${encodeURIComponent(
          text
        )}`,
        `https://dummyimage.com/400x300/4f46e5/ffffff&text=${encodeURIComponent(
          text
        )}`,
        `https://fakeimg.pl/400x300/3b82f6/ffffff/?text=${encodeURIComponent(
          text
        )}`,
      ];

      // Return a random placeholder
      const selectedPlaceholder =
        placeholders[Math.floor(Math.random() * placeholders.length)];
      console.log(
        `🖼️ Generated fallback image for ${brand} ${productName}: ${selectedPlaceholder}`
      );

      return selectedPlaceholder;
    } catch (error) {
      console.error(`💥 Error generating fallback image:`, error.message);
      return "https://via.placeholder.com/400x300/6b7280/ffffff?text=Product+Image";
    }
  }

  /**
   * Get multiple image URLs for a product (for variety)
   */
  async getMultipleProductImages(productName, brand, count = 3) {
    const images = [];

    try {
      for (let i = 0; i < count; i++) {
        const searchVariation =
          i === 0
            ? `${brand} ${productName}`
            : `${brand} ${productName} ${i === 1 ? "official" : "review"}`;

        const imageUrl = await this.getProductImageUrl(searchVariation, brand);
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }

        // Small delay between requests
        await this.sleep(200);
      }
    } catch (error) {
      console.error(`💥 Error fetching multiple images:`, error.message);
    }

    return images.length > 0
      ? images
      : [this.generateFallbackImage(productName, brand)];
  }

  /**
   * Validate if an image URL is accessible
   */
  async validateImageUrl(url) {
    try {
      const response = await axios.head(url, {
        timeout: 3000,
        maxRedirects: 3,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Sleep utility function
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Clear the image cache
   */
  clearCache() {
    this.imageCache.clear();
    console.log("🗑️ Image cache cleared");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.imageCache.size,
      keys: Array.from(this.imageCache.keys()),
    };
  }
}

// Helper function to create singleton instance
let imageServiceInstance = null;

function getImageService() {
  if (!imageServiceInstance) {
    imageServiceInstance = new ImageService();
  }
  return imageServiceInstance;
}

module.exports = {
  ImageService,
  getImageService,
};
