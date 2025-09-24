import axios from 'axios';
const AI_URL = 'http://localhost:5000/api/ai';

export const getAIRecommendation = async (preferences) => {
    const response = await axios.post(`${AI_URL}/recommendation`, { userPreferences: preferences });
    return response.data.recommendation;
};

