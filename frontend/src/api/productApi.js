import axios from "axios";
import { API_PRODUCTS_URL } from "../config/api";

export const getProducts = async (filters = {}) => {
  const result = await axios.get(API_PRODUCTS_URL, { params: filters });
  return result.data;
};

export const getProductById = async (id) => {
  const result = await axios.get(`${API_PRODUCTS_URL}/${id}`);
  return result.data;
};
