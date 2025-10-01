import axios from "axios";
import { AI_API_URL } from "../config/api";
const URL = AI_API_URL;

export const getAIRecommendation = async (prefs) => {
  const result = await axios.post(`${URL}/recommendation`, {
    userPreferences: prefs,
  });
  return result.data.recommendation;
};
