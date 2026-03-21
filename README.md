# AI Ops Agent Platform

An intelligent internal operations platform designed to automate workflows by integrating Large Language Models (LLMs) with tool-based execution, persistent memory, and robust Role-Based Access Control (RBAC).

> AI 運維助手平台：整合大語言模型、工具調用迴圈、持久化會話與嚴格的權限控管與監控系統。

---

## Getting Started (快速開始)

### 1. Prerequisites (前置作業)

- Node.js (v18+)
- Docker & Docker Compose (Recommended)
- OpenAI API Key
- Yarn (v1.x or v3+)

### 2. Quick Run with Docker (快速啟動 - 推薦方式)

```bash
# Set your API key in the root environment
export OPENAI_API_KEY=your_key_here

# Start all services (DB, Redis, Backend, Frontend)
docker-compose up --build
```

Once started, the frontend will be accessible at `http://localhost:6969`.

### 3. Local Development (本地開發模式)

Create `.env.development` in `packages/backend`:

```env
OPENAI_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@localhost:5432/ai_ops
MOCK_USER_USERNAME=admin_user # admin_user, operator_user, viewer_user
```

```bash
yarn
```

#### Setup Database (設定資料庫)

```bash
cd packages/backend
yarn db:push
```

#### Launch Development Servers (啟動開發伺服器)

```bash
# Start Backend
yarn dev
```

---

## Key Features (核心功能)

- **Intelligent AI Agent (智能 AI Agent)**: Multi-step reasoning powered by OpenAI Tool Calling. _(基於 OpenAI Tool Calling 驅動的多步推理能力。)_
- **Enterprise-Grade RBAC (企業級權限控管)**: Role-based access control for secure ops. _(以角色為基礎的存取控制，保障營運安全。)_
- **Audit Logs & AI Analysis (稽核日誌與 AI 分析)**: Full traceability with AI-powered diagnostics. _(具備 AI 診斷輔助的完整操作追溯能力。)_
- **Modern UI (現代化使用者介面)**: Dark-themed Professional interface with Markdown & Syntax Highlighting. _(支援 Markdown 與程式碼高亮的專業深色介面。)_

---

## Internal Tool Ecosystem (內建工具清單)

| Tool Name          | Description                                  | Access Level   |
| :----------------- | :------------------------------------------- | :------------- |
| `getJiraTasks`     | Fetch and filter high-priority tasks.        | All Roles      |
| `summarizeTasks`   | Statistical overview of current tasks.       | All Roles      |
| `sendNotification` | Trigger Slack/Email alerts.                  | Admin/Operator |
| `analyzeLogs`      | AI-driven diagnostic engine for system logs. | Admin/Operator |

---

## Tech Stack (技術棧)

- **Frontend (前端)**: React 19, Vite, Tailwind CSS, Zustand, React Router 7.
- **Backend (後端)**: NestJS, Drizzle ORM (PostgreSQL), OpenAI SDK.
- **Database (資料庫)**: PostgreSQL _(Session & Audit persistence / 會話與稽核持久化)_.
- **Types (共用型別)**: Shared TypeScript package `@ai-ops/types` _(共用型別模組)_.

---

## Documentation (文件說明)

For detailed design and operational instructions, please refer to the `docs` directory:
_(詳細設計與操作說明請參閱 `docs` 目錄：)_

- [API Documentation (API 介面文件)](docs/api.md)
- [Tool Registration Guide (工具註冊與擴展指南)](docs/tool-registration.md)

---

## System Design & Architecture (系統設計與架構)

This platform is designed as a **production-oriented AI agent system**, focusing on extensibility, reliability, and operational safety.
_(本平台設計為一個**面向生產環境的 AI Agent 系統**，專注於擴展性、可靠性與運維安全性。)_

- **Layered Monorepo Architecture (分層式 Monorepo 架構)**  
  The system separates frontend (React), backend (NestJS), and shared contracts into a Turborepo workspace, enabling high development velocity and strong type safety across services.
  _(系統透過 Turborepo 將前端 (React)、後端 (NestJS) 以及共用型別抽離，確保高開發效率與跨服務的強型別安全。)_

- **Relational Memory & Persistence Layer (關聯式記憶與持久化層)**  
  PostgreSQL is used to persist sessions, messages, and audit logs, enabling long-term contextual awareness and full traceability across agent interactions.
  _(使用 PostgreSQL 來持久化會話、訊息與稽核日誌，為 Agent 的互動提供長期上下文感知與完整的可追溯性。)_

- **Schema-Driven Tool System (基於 Schema 的工具系統)**  
  Tools are defined via JSON schema and dynamically registered, allowing new capabilities to be added without modifying core agent logic.
  _(工具透過 JSON schema 定義並動態註冊，無需修改核心邏輯即可輕易擴充新能力。)_

- **Event-Driven Execution (事件驅動執行 - 具備擴展性)**  
  The system is designed to evolve into an event-driven architecture where tool executions can be processed asynchronously (e.g., via queues like BullMQ), enabling better scalability and fault isolation.
  _(系統設計上可演進為事件驅動架構，工具執行能非同步處理 [如透過 BullMQ 佇列]，以提供更好的擴展性與錯誤隔離能力。)_

- **Separation of Concerns (關注點分離)**  
  The architecture strictly decouples: _(架構嚴格解耦：)_
  - Agent reasoning (LLM) _(Agent 推理)_
  - Tool execution (business logic) _(工具執行 - 業務邏輯)_
  - Workflow orchestration (multi-step control) _(工作流編排 - 多步驟控制)_

---

## Agent Execution Model (Agent 運行模型)

The system follows a **Closed-Loop Reasoning & Execution Model** with support for observability and failure handling.
_(本系統採用**閉環推理與執行模型**，並支援可觀測性與失敗處理。)_

1. **Context Enrichment (上下文豐富化)**
   - User input is combined with historical messages from PostgreSQL
     _(使用者輸入會與 PostgreSQL 中的歷史訊息結合)_
   - Ensures long-term conversational memory
     _(確保長期的對話記憶)_

2. **Reasoning Loop (Thought → Action) (推理迴圈：思考 → 行動)**
   - LLM decides whether to respond or trigger a tool
     _(LLM 決定要直接回覆或是觸發工具)_
   - Emits structured `tool_call` requests
     _(發出結構化的 `tool_call` 請求)_

3. **Secure Execution Layer (安全執行層)**
   - Tool calls pass through RBAC validation
     _(工具調用需通過角色權限 [RBAC] 驗證)_
   - Unauthorized actions are rejected with structured errors
     _(未經授權的行為將被拒絕並回傳結構化錯誤)_

4. **Tool Execution & Resilience (工具執行與韌性)**
   - Tools are executed via a centralized executor
     _(工具透過集中式的執行器來執行)_
   - Supports: _(支援：)_
     - Retry mechanisms (future extension) _(重試機制 - 未來擴展)_
     - Timeout handling _(超時處理)_
     - Error normalization _(錯誤正規化)_

5. **Observation Feedback (觀察反饋)**
   - Tool results are injected back into the LLM
     _(工具執行結果會再次注入到 LLM 當中)_
   - Enables multi-step reasoning and iterative refinement
     _(實現多步驟推理與反覆疊代改進)_

6. **Audit & Logging (稽核與日誌紀錄)**
   - Each step (input, tool call, result) is persisted
     _(每一個步驟 [輸入、調用、結果] 都會被持久化保存)_
   - Provides full traceability and debugging capability
     _(提供完整的可追溯性與除錯能力)_

---

## Scalability & Extensibility (擴展性與擴容能力)

The system is designed to scale from a prototype into an enterprise-grade internal platform.
_(本系統設計旨在從原型架構擴展為企業級別的內部平台。)_

- **Stateless Backend Services (無狀態後端服務)**
  NestJS services are stateless and rely on PostgreSQL for persistence, allowing horizontal scaling behind a load balancer.
  _(NestJS 服務設計為無狀態，所有持久化依賴 PostgreSQL，可輕鬆地在負載平衡器後方水平擴展。)_

- **Async Task Processing (Future) (非同步任務處理 - 未來)**
  Tool execution can be extended to async workers using message queues (e.g., BullMQ), enabling:
  _(工具的執行可透過訊息佇列 [如 BullMQ] 擴充給非同步 Worker，實現：)_
  - High-throughput processing _(高吞吐量處理)_
  - Failure isolation _(錯誤隔離)_
  - Retry mechanisms _(重試機制)_

- **Pluggable Tool Ecosystem (可插拔式工具生態系統)**
  New tools can be added with minimal changes:
  _(加入新工具只需極少的更動：)_
  - Define schema _(定義 Schema)_
  - Register in tool registry _(在註冊表登記)_
  - Implement handler _(實作處理函數)_

- **Observability & Debuggability (可觀測性與除錯能力)**
  - Audit logs for traceability _(透過稽核日誌實現任務追溯)_
  - Structured logging for debugging _(透過結構化日誌協助除錯)_
  - Future integration with monitoring systems (e.g., Grafana) _(未來可與監控系統整合，如 Grafana)_

- **Security-first Design (安全性優先設計)**
  - RBAC enforcement at execution layer _(在執行層強制執行角色管控)_
  - Audit trail for all actions _(所有動作均有稽核軌跡)_
  - Prevents unsafe agent behavior _(防止 Agent 執行不安全的行為)_

---

## Trade-offs & Design Decisions (取捨與設計決策)

- Chose relational DB over vector DB for structured auditability
  _(選擇關聯式資料庫而非向量資料庫，以確保結構化的稽核審查能力)_
- Prioritized synchronous execution for simplicity, with async extensibility
  _(優先考量同步執行以保持架構簡單，同時保留非同步擴充的彈性)_
- Used tool-based architecture instead of monolithic prompts for scalability
  _(採用基於工具的架構取代單體式超長提示詞 [Prompt]，以獲得更好的擴展性)_

---

## Key Features & Roadmap (核心功能與技術路徑)

- [x] **Monorepo Architecture (Turborepo)**: Structured modular design with strong type-safety. (模組化架構，強型別約束。)
- [x] **Closed-Loop Reasoning**: AI autonomously decides tool calls and performs multi-step reasoning. (AI 自動決定工具調用與多步推理。)
- [x] **Asynchronous Execution (BullMQ)**: Job dispatching with BullMQ for scalable tool executions. (非同步任務派發與執行。)
- [x] **Enterprise-Grade RBAC**: Strict role-based access control for operations safety. (基於角色的嚴謹權限控管。)
- [x] **Audit Logs & Performance Monitoring**: Traceability, latency, and token usage analysis for every action. (AI 行為追蹤、耗時與 Token 分析。)
- [x] **AI-Driven Diagnostics**: Dynamic log analysis and automated repair suggestions. (動態日誌分析與修復建議。)

---
