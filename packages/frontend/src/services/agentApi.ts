import axios from "axios";

/**
 * 與後端 Agent API 溝通的 Service
 */
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:6970/agent";

export const chatWithAgent = async (message: string, history: any[] = [], conversationId?: string | null) => {
  const response = await axios.post(`${BACKEND_URL}/chat`, {
    message: message,
    history: history,
    conversationId: conversationId,
  });
  return response.data;
};

/**
 * 取得所有歷史對話列表
 */
export const getConversationsList = async () => {
  const response = await axios.get(`${BACKEND_URL}/conversations`);
  return response.data;
};

/**
 * 取得特定會話的訊息紀錄
 */
export const getConversationHistory = async (id: string) => {
  const response = await axios.get(`${BACKEND_URL}/conversations/${id}`);
  return response.data;
};
