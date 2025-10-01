import axios from "axios";
import { API_PRODUCTS_URL } from "../config/api";
const URL = API_PRODUCTS_URL;

export const getProducts = async (filters = {}) => {
  const result = await axios.get(URL, { params: filters });
  return result.data;
};

export const getProductById = async (id) => {
  const result = await axios.get(`${URL}/${id}`);
  return result.data;
};
