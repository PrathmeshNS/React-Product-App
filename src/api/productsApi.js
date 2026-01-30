import axios from "axios";
import { handleError } from "../utils/errorHandler";

// Fetch products with pagination and optional search
// Options: { limit, skip, q }
export const fetchProducts = async (options = {}) => {
  try {
    const { limit = 12, skip = 0, q } = options;

    let url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
    if (q && q.trim()) {
      // Use search endpoint for queries
      url = `https://dummyjson.com/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`;
    }

    const res = await axios.get(url);
    // dummyjson returns { products, total, skip, limit }
    return {
      products: res.data.products || [],
      total: res.data.total || 0,
    };
  } catch (error) {
    throw new Error(handleError(error));
  }
};
