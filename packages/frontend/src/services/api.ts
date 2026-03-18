import axios from "axios";

const baseURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:6988/api/v1";

const api = axios.create({
  baseURL,
});

export default api;
