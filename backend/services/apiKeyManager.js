const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * API Key Manager for automatic rotation when rate limits are reached
 * Supports multiple API keys and intelligent fallback
 */
class ApiKeyManager {
  constructor() {
    this.keys = [];
    this.currentKeyIndex = 0;
    this.keyStatus = new Map(); // Track failures per key
    this.cooldownPeriod = 60000; // 1 minute cooldown for failed keys
    this.maxFailuresBeforeCooldown = 3;
    this.clients = new Map(); // Cache AI clients
    this.models = new Map(); // Cache models

    this.initializeKeys();
  }

  /**
   * Initialize API keys from environment variables
   * Supports GOOGLE_API_KEY, GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc.
   */
  initializeKeys() {
    const keys = [];

    // Check for primary key
    if (
      process.env.GOOGLE_API_KEY &&
      process.env.GOOGLE_API_KEY !== "your_google_api_key_here"
    ) {
      keys.push({
        key: process.env.GOOGLE_API_KEY,
        name: "Primary",
        index: 0,
      });
    }

    // Check for numbered keys (GOOGLE_API_KEY_1, GOOGLE_API_KEY_2, etc.)
    let keyIndex = 1;
    while (process.env[`GOOGLE_API_KEY_${keyIndex}`]) {
      const key = process.env[`GOOGLE_API_KEY_${keyIndex}`];
      if (key && key !== "your_google_api_key_here") {
        keys.push({
          key: key,
          name: `Key ${keyIndex}`,
          index: keyIndex,
        });
      }
      keyIndex++;
    }

    if (keys.length === 0) {
      console.warn(
        "⚠️  No valid Google API keys found in environment variables"
      );
      return;
    }

    this.keys = keys;
    console.log(
      `✅ API Key Manager initialized with ${keys.length} key(s): ${keys
        .map((k) => k.name)
        .join(", ")}`
    );

    // Initialize status tracking for each key
    this.keys.forEach((keyInfo) => {
      this.keyStatus.set(keyInfo.index, {
        failures: 0,
        lastFailure: null,
        totalRequests: 0,
        successfulRequests: 0,
        isInCooldown: false,
      });
    });

    // Pre-initialize all clients and models
    this.initializeClients();
  }

  /**
   * Initialize AI clients and models for all keys
   */
  initializeClients() {
    this.keys.forEach((keyInfo) => {
      try {
        const genAI = new GoogleGenerativeAI(keyInfo.key);
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE",
            },
          ],
        });

        this.clients.set(keyInfo.index, genAI);
        this.models.set(keyInfo.index, model);

        console.log(
          `✅ Initialized AI client for ${keyInfo.name} (gemini-2.5-flash)`
        );
      } catch (error) {
        console.error(
          `❌ Failed to initialize ${keyInfo.name}:`,
          error.message
        );
      }
    });
  }

  /**
   * Get the current active API key info
   */
  getCurrentKey() {
    if (this.keys.length === 0) return null;
    return this.keys[this.currentKeyIndex];
  }

  /**
   * Get the current active model
   */
  getCurrentModel() {
    const currentKey = this.getCurrentKey();
    if (!currentKey) return null;
    return this.models.get(currentKey.index);
  }

  /**
   * Check if a key is currently in cooldown
   */
  isKeyInCooldown(keyIndex) {
    const status = this.keyStatus.get(keyIndex);
    if (!status || !status.isInCooldown) return false;

    const timeSinceLastFailure = Date.now() - status.lastFailure;
    if (timeSinceLastFailure > this.cooldownPeriod) {
      // Cooldown expired, reset
      status.isInCooldown = false;
      status.failures = 0;
      this.keyStatus.set(keyIndex, status);
      console.log(
        `🔄 ${this.keys[keyIndex].name} cooldown expired, back in rotation`
      );
      return false;
    }

    return true;
  }

  /**
   * Find next available key (not in cooldown)
   */
  findNextAvailableKey() {
    // Ensure cooldown status is up-to-date for all keys
    this.keys.forEach((keyInfo) => {
      this.isKeyInCooldown(keyInfo.index);
    });

    const availableKeys = this.keys.filter(
      (keyInfo) => !this.isKeyInCooldown(keyInfo.index)
    );

    if (availableKeys.length === 0) {
      // All keys in cooldown, use the one with oldest failure
      console.warn("⚠️  All keys in cooldown, using least recently failed");
      let oldestFailureKey = this.keys[0];
      let oldestTime = this.keyStatus.get(oldestFailureKey.index).lastFailure;

      this.keys.forEach((keyInfo) => {
        const status = this.keyStatus.get(keyInfo.index);
        if (status.lastFailure < oldestTime) {
          oldestTime = status.lastFailure;
          oldestFailureKey = keyInfo;
        }
      });

      return oldestFailureKey.index;
    }

    // Return the next available key in rotation
    const currentIndex = this.currentKeyIndex;
    for (let i = 1; i <= this.keys.length; i++) {
      const checkIndex = (currentIndex + i) % this.keys.length;
      const keyInfo = this.keys[checkIndex];
      if (!this.isKeyInCooldown(keyInfo.index)) {
        return keyInfo.index;
      }
    }

    return availableKeys[0].index;
  }

  /**
   * Rotate to the next API key
   */
  rotateKey() {
    if (this.keys.length <= 1) {
      console.warn("⚠️  Only one API key available, cannot rotate");
      return false;
    }

    const oldIndex = this.currentKeyIndex;
    const oldKeyName = this.keys[oldIndex].name;

    // Find next available key
    const nextIndex = this.findNextAvailableKey();
    this.currentKeyIndex = nextIndex;

    const newKeyName = this.keys[nextIndex].name;
    console.log(`🔄 Rotated from ${oldKeyName} to ${newKeyName}`);

    return true;
  }

  /**
   * Record a successful request
   */
  recordSuccess(keyIndex = this.currentKeyIndex) {
    const status = this.keyStatus.get(keyIndex);
    if (status) {
      status.totalRequests++;
      status.successfulRequests++;
      // Reset failures on success
      status.failures = 0;
      status.isInCooldown = false;
      this.keyStatus.set(keyIndex, status);
    }
  }

  /**
   * Record a failed request and determine if rotation is needed
   */
  recordFailure(error, keyIndex = this.currentKeyIndex) {
    const status = this.keyStatus.get(keyIndex);
    const keyName = this.keys[keyIndex].name;

    if (status) {
      status.totalRequests++;
      status.failures++;
      status.lastFailure = Date.now();

      // Check if it's a rate limit error
      const isRateLimitError =
        error.message?.includes("429") ||
        error.message?.includes("rate limit") ||
        error.message?.includes("quota") ||
        error.message?.includes("RESOURCE_EXHAUSTED") ||
        error.status === 429;

      if (isRateLimitError) {
        console.warn(`⚠️  Rate limit detected for ${keyName}`);
        status.isInCooldown = true;
        this.keyStatus.set(keyIndex, status);
        return { shouldRotate: true, reason: "rate_limit" };
      }

      // Check if it's a temporary error that should trigger rotation
      const isTemporaryError =
        error.message?.includes("503") ||
        error.message?.includes("overloaded") ||
        error.message?.includes("timeout") ||
        error.message?.includes("fetch failed");

      if (isTemporaryError && status.failures >= 2) {
        console.warn(`⚠️  Multiple temporary errors for ${keyName}`);
        status.isInCooldown = true;
        this.keyStatus.set(keyIndex, status);
        return { shouldRotate: true, reason: "temporary_errors" };
      }

      // Put key in cooldown if too many failures
      if (status.failures >= this.maxFailuresBeforeCooldown) {
        console.warn(
          `⚠️  ${keyName} exceeded failure threshold, entering cooldown`
        );
        status.isInCooldown = true;
        this.keyStatus.set(keyIndex, status);
        return { shouldRotate: true, reason: "max_failures" };
      }

      this.keyStatus.set(keyIndex, status);
    }

    return { shouldRotate: false, reason: null };
  }

  /**
   * Make an AI request with automatic rotation on failure
   */
  async makeRequest(prompt, maxRetries = 3) {
    if (this.keys.length === 0) {
      throw new Error("No API keys available");
    }

    let lastError = null;
    let attemptedKeys = new Set();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const currentKey = this.getCurrentKey();
      const model = this.getCurrentModel();

      if (!model) {
        throw new Error("No valid model available");
      }

      // Check if we've tried all keys
      attemptedKeys.add(currentKey.index);
      if (attemptedKeys.size === this.keys.length && attempt > 1) {
        console.warn(
          "⚠️  All keys have been attempted, retrying with exponential backoff"
        );
        const waitTime = Math.min(Math.pow(2, attempt) * 1000, 10000);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }

      try {
        console.log(
          `🔄 Attempt ${attempt}/${maxRetries} using ${currentKey.name}`
        );

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Request timeout after 35 seconds")),
            35000
          )
        );

        const aiPromise = (async () => {
          const result = await model.generateContent(prompt);
          const response = await result.response;

          // Debug logging
          console.log(
            `🔍 Response candidates: ${response.candidates?.length || 0}`
          );
          if (response.candidates && response.candidates[0]) {
            console.log(
              `🔍 Finish reason: ${response.candidates[0].finishReason}`
            );
            console.log(
              `🔍 Content parts: ${
                response.candidates[0].content?.parts?.length || 0
              }`
            );
          }

          const text = response.text();
          console.log(`🔍 Response text length: ${text?.length || 0}`);
          return text;
        })();

        const text = await Promise.race([aiPromise, timeoutPromise]);

        // Success! Record it
        this.recordSuccess(currentKey.index);
        console.log(`✅ Request successful using ${currentKey.name}`);

        return text;
      } catch (error) {
        lastError = error;
        console.error(
          `❌ Request failed with ${currentKey.name}:`,
          error.message
        );

        // Record failure and check if we should rotate
        const { shouldRotate, reason } = this.recordFailure(
          error,
          currentKey.index
        );

        if (shouldRotate) {
          console.log(`🔄 Rotating key due to: ${reason}`);
          const rotated = this.rotateKey();

          if (!rotated && this.keys.length > 1) {
            // Couldn't rotate, might be all keys in cooldown
            console.warn("⚠️  Could not rotate to a healthy key");
          }

          // Continue to next attempt with new key
          continue;
        } else if (attempt < maxRetries) {
          // Not a rotation-worthy error, but we can retry with same key
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Waiting ${waitTime / 1000}s before retry...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        }

        // If last attempt, try rotating anyway
        if (attempt === maxRetries && this.keys.length > 1) {
          console.log("🔄 Last attempt failed, trying key rotation");
          this.rotateKey();
        }
      }
    }

    // All attempts failed
    throw (
      lastError ||
      new Error(`All ${maxRetries} attempts failed with all available keys`)
    );
  }

  /**
   * Get statistics about key usage
   */
  getStatistics() {
    const stats = {
      totalKeys: this.keys.length,
      currentKey: this.getCurrentKey()?.name,
      keys: [],
    };

    this.keys.forEach((keyInfo) => {
      const status = this.keyStatus.get(keyInfo.index);
      stats.keys.push({
        name: keyInfo.name,
        totalRequests: status.totalRequests,
        successfulRequests: status.successfulRequests,
        failureRate:
          status.totalRequests > 0
            ? (
                ((status.totalRequests - status.successfulRequests) /
                  status.totalRequests) *
                100
              ).toFixed(2) + "%"
            : "0%",
        inCooldown: status.isInCooldown,
        failures: status.failures,
      });
    });

    return stats;
  }

  /**
   * Check if the manager has any valid keys configured
   */
  hasKeys() {
    return this.keys.length > 0;
  }

  /**
   * Get count of available keys
   */
  getKeyCount() {
    return this.keys.length;
  }
}

// Export singleton instance
module.exports = new ApiKeyManager();
