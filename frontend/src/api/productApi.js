import axios from 'axios';
const API_URL = 'http://localhost:5000/api/products';

export const getProducts = async (filters = {}) => {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
};

export const getProductById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

