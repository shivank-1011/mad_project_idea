const axios = require("axios");

class ImageService {
  constructor() {

    this.imageCache = new Map();


    this.lastRequest = 0;
    this.requestDelay = 100;
  }


  async getProductImageUrl(productName, brand) {
    try {
      const searchQuery = `${brand} ${productName}`;
      const cacheKey = `${brand}_${productName}`
        .toLowerCase()
        .replace(/\s+/g, "_");


      if (this.imageCache.has(cacheKey)) {
        console.log(`📷 Using cached image for ${searchQuery}`);
        return this.imageCache.get(cacheKey);
      }


      const now = Date.now();
      if (now - this.lastRequest < this.requestDelay) {
        await this.sleep(this.requestDelay - (now - this.lastRequest));
      }
      this.lastRequest = Date.now();

      console.log(`🔍 Searching for image: ${searchQuery}`);


      let imageUrl = await this.searchUnsplash(searchQuery);

      if (!imageUrl) {
        imageUrl = await this.searchPixabay(searchQuery);
      }

      if (!imageUrl) {
        imageUrl = await this.generateFallbackImage(productName, brand);
      }


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


  async searchUnsplash(query) {
    try {

      const cleanQuery = encodeURIComponent(query.replace(/\s+/g, "+"));
      const unsplashUrl = `https://source.unsplash.com/400x300/?${cleanQuery}`;


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


  async searchPixabay(query) {
    try {

      const cleanQuery = encodeURIComponent(query);


      const pixabayUrl = `https://pixabay.com/api/?key=YOUR_API_KEY&q=${cleanQuery}&image_type=photo&per_page=3`;

      console.log(`ℹ️ Pixabay search would be: ${pixabayUrl}`);

      return null;
    } catch (error) {
      console.log(`⚠️ Pixabay search failed for "${query}":`, error.message);
    }
    return null;
  }


  generateFallbackImage(productName, brand) {
    try {

      const text = `${brand} ${productName}`.replace(/\s+/g, "+");


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


        await this.sleep(200);
      }
    } catch (error) {
      console.error(`💥 Error fetching multiple images:`, error.message);
    }

    return images.length > 0
      ? images
      : [this.generateFallbackImage(productName, brand)];
  }


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


  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }


  clearCache() {
    this.imageCache.clear();
    console.log("🗑️ Image cache cleared");
  }


  getCacheStats() {
    return {
      size: this.imageCache.size,
      keys: Array.from(this.imageCache.keys()),
    };
  }
}


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
