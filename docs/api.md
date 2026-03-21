# AI Ops Platform API Documentation

This document describes the backend API endpoints for the AI Ops Platform.
(本文件說明 AI Ops 平台的後端 API 介面。)

## Base URL
Default development: `http://localhost:6890/api/v1`

---

## 1. Agent Interface (對話介面)

### Send Message (發送對話訊息)
`POST /agent/chat`

Triggers the AI reasoning loop with support for role-based system prompts and dry-run mode.
(觸發 AI 推理循環。支援角色設定與預演模式。)

**Request Body:**
```json
{
  "message": "List all high priority tasks",
  "history": [],
  "conversationId": "uuid-optional",
  "agentRole": "SRE", // Optional: SRE, Dev, Sec (Default: SRE)
  "dryRun": false // Optional: If true, generated actions won't be executed
}
```

**Response Body:**
```json
{
  "success": true,
  "data": "Resulting text content...",
  "conversationId": "uuid"
}
```

### List Conversations (取得會話列表)
`GET /agent/conversations`
Returns all conversations sorted by creation date (descending).
(回傳按時間倒序的所有會話。)

### Get Conversation Messages (取得特定會話訊息)
`GET /agent/conversations/:id`
Returns all historical messages for a specific conversation.
(回傳該會話的所有歷史對話訊息。)

---

## 2. Audit & Analysis (審核與分析)

### Get System Audit Logs (取得系統審核日誌 - Admin Only)
`GET /agent/audit-logs`
Returns all tool execution records, including Trace ID, latency, and token usage.
(回傳所有工具執行紀錄，包含 Trace ID、耗時與 Token 消耗。)

### Offline Log Analysis (離線分析日誌)
`POST /agent/audit-logs/:id/analyze`
Invokes the AI to perform deep diagnosis and suggest fixes for a single tool execution.
(調用 AI 對單一工具執行結果進行深度分析與修復建議。)

### Real-time Log Stream (即時日誌串流 - SSE)
`GET /agent/audit-logs/stream`
A Server-Sent Events (SSE) endpoint to receive new tool execution logs in real-time.
(透過 SSE 即時取得新觸發的工具執行日誌。)

---

## 3. Performance Monitoring Metrics (性能監控指標)

All `assistant` messages include a `metadata` field with the following performance data:
(所有 `assistant` 訊息的 `metadata` 欄位皆包含以下數據：)
- `usage`: Detailed OpenAI token usage statistics. (OpenAI Token 消耗詳細統計)
- `latencyMs`: Total duration of the reasoning cycle, including tool execution wait time. (完整推理循環的總耗時)

Audit logs also contain a `latencyMs` field, recording the net time taken from job dispatch to result return.
(工具執行日誌包含 `latencyMs` 欄位，紀錄單個工具從派發到返回結果的淨耗時。)
