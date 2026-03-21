import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";

/**
 * 使用者表：儲存使用者的身份與權限角色
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "viewer", "operator"] })
    .default("viewer")
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * 對話紀錄表：讀儲存每一次的使用者會話
 */
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title"),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }), // 關聯使用者
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * 訊息表：儲存每一則對話訊息
 */
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  role: text("role", { enum: ["user", "assistant", "system", "tool"] }).notNull(),
  content: text("content").notNull(),
  toolCalls: jsonb("tool_calls"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * 審核日誌表 (Audit Logs)：記錄敏感操作
 */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // 例如: "CALL_TOOL", "DELETE_CONV"
  toolName: text("tool_name"),
  input: jsonb("input"),
  output: jsonb("output"),
  status: text("status", { enum: ["success", "failed", "dry-run"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
