import axios from "axios";
import { AI_API_URL } from "../config/api";

export const getAIRecommendation = async (prefs) => {
  const result = await axios.post(`${AI_API_URL}/recommendation`, {
    userPreferences: prefs,
  });
  return result.data.recommendation;
};
