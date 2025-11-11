import axios from "axios";
import { AI_API_URL } from "../config/api";

export const getAIRecommendation = async (prefs) => {
  try {
    console.log("🤖 Sending AI request to:", `${AI_API_URL}/recommendation`);
    console.log("📤 Request payload:", { userPreferences: prefs });

    const result = await axios.post(`${AI_API_URL}/recommendation`, {
      userPreferences: prefs,
    });

    console.log("✅ AI Response received:", result.data);

    // Backend returns both 'message' (new format) and 'recommendation' (old format for compatibility)
    const response = result.data.message || result.data.recommendation;

    if (!response) {
      console.error(
        "❌ No message or recommendation in response:",
        result.data
      );
      throw new Error("Invalid response format from server");
    }

    return response;
  } catch (error) {
    console.error("❌ AI API Error:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};
