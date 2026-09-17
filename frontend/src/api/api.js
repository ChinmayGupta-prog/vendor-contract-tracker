import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  timeout: 15000,
});

export function errorMessage(error) {
  return error.response?.data?.message ||
    (error.response ? "The request failed. Please try again." :
      "Cannot reach the server. Check that the backend is running and try again.");
}

export default api;
