import axios from "axios";

/**
 * 與後端 Agent API 溝通的 Service
 */
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:6970/agent";

export const chatWithAgent = async (message: string) => {
  const response = await axios.post(`${BACKEND_URL}/chat`, {
    message: message,
  });
  return response.data;
};
