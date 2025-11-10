

const getBaseUrl = () => {



  return "http://localhost:3001";
};

export const API_BASE_URL = getBaseUrl();
export const API_PRODUCTS_URL = `${API_BASE_URL}/api/products`;
export const AI_API_URL = "http://localhost:5000/api/ai";
