// API Configuration
// For React Native development - adjust the IP address for device testing
const getBaseUrl = () => {
  // Use localhost for web/Expo web
  // Use 10.0.2.2 for Android emulator
  // Use your computer's IP address for physical devices
  return "http://localhost:3001";
};

export const API_BASE_URL = getBaseUrl();
export const API_PRODUCTS_URL = `${API_BASE_URL}/api/products`;
export const AI_API_URL = "http://localhost:5000/api/ai";
