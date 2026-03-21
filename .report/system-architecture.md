## System Architecture (系統架構)

```text
                        ┌────────────────────────────┐
                        │        React Client        │
                        │  (Chat UI + Tool Logs UI)  │
                        └─────────────┬──────────────┘
                                      │ HTTP (REST)
                                      ▼
                        ┌────────────────────────────┐
                        │        NestJS API          │
                        │ (Controllers + RBAC Guard) │
                        └─────────────┬──────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             ▼                        ▼                        ▼
 ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
 │  AgentCore Layer   │   │ PostgreSQL Database│   │ Auth & Authz Block │
 │ (LLM Orchestration)│   │ (Drizzle Sessions) │   │ (RBAC DB Checks)   │
 └─────────┬──────────┘   └─────────┬──────────┘   └─────────┬──────────┘
           │                        │                        │
           ▼                        ▼                        ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                  BullMQ Queue Execution Layer                │
 │  - Tool Registry Schemas (Zod Definition via tool-registry)  │
 │  - Tool Dispatcher (NestJS agent.service -> Queue)           │
 │  - Tool Worker (Executes the dispatched task logic)          │
 └───────────────┬───────────────────────────────┬──────────────┘
                 │                               │
     ┌───────────▼──────────┐         ┌──────────▼──────────┐
     │ Persistent Audit Logs│         │ External Cloud APIs │
     │ (Written to DB by    │         │ (3rd Party APIs)    │
     │ worker post-execute) │         │                     │
     │                      │         │ - OpenAI API        │
     │ - Trace IDs & Latency│         │ - Slack Workspace   │
     │ - Execution Status   │         │ - Jira Boards       │
     └──────────────────────┘         └─────────────────────┘
```

---

## Core Layers Explained (核心分層詳解)

### Agent Layer / LLM Orchestration (代理層 - LLM 編排)

- Responsible for: _(主要負責：)_
  - Understanding user intent. _(解析使用者的意圖)_
  - Selecting tools dynamically. _(動態選擇適合的工具)_
  - Managing the continuous tool-calling loop (`AgentLoop`). _(掌管 `AgentLoop` 連續調用迴圈)_

- Implements: _(具體實作：)_
  - Contextual prompt strategies via Database messages. _(透過資料庫訊息建構上下文的 Prompt 策略)_
  - Passing strict OpenAI tool schemas. _(傳遞嚴謹的 OpenAI 工具 Schema)_
  - Synthesizing partial results into coherent sentences. _(將局部工具結果合成為連貫的語句)_

---

### Workflow Engine / Tool Execution Layer (工具執行排程層)

- Central abstraction for all tool operations using BullMQ. _(涵蓋所有工具操作並導入 BullMQ 佇列)_
- Responsibilities: _(主要職責：)_
  - Register JSON Schemas via `tool-registry`. _(透過 `tool-registry` 註冊 JSON Schema)_
  - Validate parameters securely. _(安全驗證傳入參數)_
  - Route execution tasks to background queues natively. _(原生地將執行任務派往背景佇列)_
  - Normalize execution results for the LLM. _(將執行結果正規化回 LLM 能理解的結構)_

**Key Design: strict decoupling of LLM intelligence from external business logic.**
_(核心設計理念：將 LLM 智慧與外部業務邏輯嚴格解耦。)_

---

### Auth / RBAC Layer (權限與角色控制層)

- Controls: _(管控目標：)_
  - Verifies who holds the necessary permissions to trigger specific ops tools. _(驗證誰具備觸發特定維運工具的權限)_
  - Prevents unsafe agent hallucination operations. _(預防 Agent 幻覺造成的不安全操作)_

- Useful for: _(主要幫助：)_
  - Maintaining internal enterprise security standards. _(維持內部企業安全規範)_
  - Strict audit readiness. _(確保具備嚴格的稽核防禦)_

---

### Observability Layer (可觀測性層)

- Centralized `audit_logs` tracking inside PostgreSQL Database. _(透過 PostgreSQL 資料庫中的 `audit_logs` 進行追蹤)_
- Metrics monitored: _(受監控的數據：)_
  - Execution success/dry-run/fail statuses. _(執行成功、測試運行與失敗狀態)_
  - Agent tracing via TraceID boundaries. _(透過 TraceID 的流程軌跡)_
  - Overall tool invocation latencies. _(工具呼叫的整體延遲耗時)_

---

## Data Flow (Execution Flow / 執行資料流向)

```text
User Input (前端使用者輸入)
         ↓
NestJS API (載入 PostgreSQL 歷史上下文)
         ↓
AgentLoop (LLM 進行推理決策)
         ↓
Tool Call Requested (生成結構化呼叫請求)
         ↓
RBAC Guard (驗證角色執行存取權限)
         ↓
BullMQ Dispatcher (放置進工具派發佇列)
         ↓
Worker Layer (背景執行外部系統實際操作)
         ↓
Result & Audit (保存日誌與觀測反饋)
         ↓
AgentLoop (LLM 獲取結果並產生最終回覆)
         ↓
React Frontend (回傳呈現給前端客戶端)
```

---

## Design Principles (設計準則)

- **Tool-first architecture (NOT prompt-only)**: Intelligence relies heavily on safe tooling execution. _(工具優先架構 [非單一長咒語]，由安全工具執行推動智慧)_
- **Decoupled execution**: Separate reasoning loops and logic handlers into multi-package architecture. _(將推理迴圈與處理邏輯解耦為多套件結構)_
- **Extensible system (Plug new tools easily)**: Schema-based integration allows highly frictionless updates. _(基於 Schema 的整合提供極度平滑的功能升級與抽換)_
- **Production-oriented (not just demo)**: BullMQ, Database state constraints, and User RBAC ensure safety. _(注重生產就緒能力：利用 BullMQ、狀態控制與 RBAC 保護)_
- **Observable & Debuggable**: Deep integrations into tracing, error surfacing, and structured latency tracking. _(高度可觀測與易於除錯，深度整合 Tracing 與結構化日誌)_
