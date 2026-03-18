/**
 * 使用者角色
 */
export type UserRole = "admin" | "operator" | "viewer";

/**
 * 通用的訊息角色
 */
export type MessageRole = "user" | "assistant" | "system" | "tool";

/**
 * 訊息定義
 */
export interface Message {
  id?: string;
  role: MessageRole;
  content: string;
  createdAt?: string;
}

/**
 * 對話會話定義
 */
export interface Conversation {
  id: string;
  title: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 審核日誌定義
 */
export interface AuditLog {
  id: string;
  userId: string | null;
  username?: string; // 關聯後的名稱
  action: string;
  toolName: string | null;
  input: any;
  output: any;
  status: "success" | "failed";
  createdAt: string;
  aiAnalysis?: string; // 用於 AI 分析結果
}

/**
 * Jira 任務定義
 */
export interface JiraTask {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  labels: string[];
  description: string;
}

/**
 * API 回傳包裝
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  conversationId?: string;
}

/**
 * 任務統計摘要定義
 */
export interface TaskSummary {
  totalCount: number;
  statusBreakdown: Record<string, number>;
  priorityBreakdown: Record<string, number>;
  summary: string;
}
