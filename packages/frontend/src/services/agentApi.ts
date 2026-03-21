import axios from "axios";
import type { Message, Conversation, AuditLog, ApiResponse } from "@ai-ops/types";

/**
 * 與後端 Agent API 溝通的 Service
 */
export const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:6890/api/v1/agent";

export const chatWithAgent = async (
  message: string,
  history: Message[] = [],
  conversationId?: string | null,
  agentRole?: string
): Promise<ApiResponse<string>> => {
  const response = await axios.post(`${BACKEND_URL}/chat`, {
    message: message,
    history: history,
    conversationId: conversationId,
    agentRole: agentRole,
  });
  return response.data;
};

/**
 * 取得所有歷史對話列表
 */
export const getConversationsList = async (): Promise<ApiResponse<Conversation[]>> => {
  const response = await axios.get(`${BACKEND_URL}/conversations`);
  return response.data;
};

/**
 * 取得特定會話的訊息紀錄
 */
export const getConversationHistory = async (id: string): Promise<ApiResponse<Message[]>> => {
  const response = await axios.get(`${BACKEND_URL}/conversations/${id}`);
  return response.data;
};

/**
 * 取得審核日誌 (限制 Admin)
 */
export const getAuditLogs = async (): Promise<ApiResponse<AuditLog[]>> => {
  const response = await axios.get(`${BACKEND_URL}/audit-logs`);
  return response.data;
};

/**
 * 分析特定的審核日誌 (Admin/Operator)
 */
export const analyzeAuditLog = async (id: string): Promise<ApiResponse<string>> => {
  const response = await axios.post(`${BACKEND_URL}/audit-logs/${id}/analyze`);
  return response.data;
};
