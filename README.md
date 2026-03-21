# AI Ops Agent Platform

An intelligent internal operations platform designed to automate workflows by integrating Large Language Models (LLMs) with tool-based execution, persistent memory, and robust Role-Based Access Control (RBAC).

> AI 運維助手平台：整合大語言模型、工具調用迴圈、持久化會話與嚴格的權限控管與監控系統。

---

## System Design & Architecture (系統設計與架構)

This platform is designed as a **production-oriented AI agent system**, focusing on extensibility, reliability, and operational safety.

- **Layered Monorepo Architecture**  
  The system separates frontend (React), backend (NestJS), and shared contracts into a Turborepo workspace, enabling high development velocity and strong type safety across services.

- **Relational Memory & Persistence Layer**  
  PostgreSQL is used to persist sessions, messages, and audit logs, enabling long-term contextual awareness and full traceability across agent interactions.

- **Schema-Driven Tool System**  
  Tools are defined via JSON schema and dynamically registered, allowing new capabilities to be added without modifying core agent logic.

- **Event-Driven Execution (Extensible)**  
  The system is designed to evolve into an event-driven architecture where tool executions can be processed asynchronously (e.g., via queues like BullMQ), enabling better scalability and fault isolation.

- **Separation of Concerns**  
  The architecture strictly decouples:
  - Agent reasoning (LLM)
  - Tool execution (business logic)
  - Workflow orchestration (multi-step control)

---

## Agent Execution Model (Agent 運行模型)

The system follows a **Closed-Loop Reasoning & Execution Model** with support for observability and failure handling.

1. **Context Enrichment**
   - User input is combined with historical messages from PostgreSQL
   - Ensures long-term conversational memory

2. **Reasoning Loop (Thought → Action)**
   - LLM decides whether to respond or trigger a tool
   - Emits structured `tool_call` requests

3. **Secure Execution Layer**
   - Tool calls pass through RBAC validation
   - Unauthorized actions are rejected with structured errors

4. **Tool Execution & Resilience**
   - Tools are executed via a centralized executor
   - Supports:
     - Retry mechanisms (future extension)
     - Timeout handling
     - Error normalization

5. **Observation Feedback**
   - Tool results are injected back into the LLM
   - Enables multi-step reasoning and iterative refinement

6. **Audit & Logging**
   - Each step (input, tool call, result) is persisted
   - Provides full traceability and debugging capability

7. **(Future) Async Execution**
   - Long-running tasks can be offloaded to background workers
   - Enables scalable agent workflows (e.g., batch processing)

---

## Scalability & Extensibility (擴展性與擴容能力)

The system is designed to scale from a prototype into an enterprise-grade internal platform.

- **Stateless Backend Services**
  NestJS services are stateless and rely on PostgreSQL for persistence, allowing horizontal scaling behind a load balancer.

- **Async Task Processing (Future)**
  Tool execution can be extended to async workers using message queues (e.g., BullMQ), enabling:
  - High-throughput processing
  - Failure isolation
  - Retry mechanisms

- **Pluggable Tool Ecosystem**
  New tools can be added with minimal changes:
  - Define schema
  - Register in tool registry
  - Implement handler

- **Observability & Debuggability**
  - Audit logs for traceability
  - Structured logging for debugging
  - Future integration with monitoring systems (e.g., Grafana)

- **Security-first Design**
  - RBAC enforcement at execution layer
  - Audit trail for all actions
  - Prevents unsafe agent behavior

---

## Trade-offs & Design Decisions

- Chose relational DB over vector DB for structured auditability
- Prioritized synchronous execution for simplicity, with async extensibility
- Used tool-based architecture instead of monolithic prompts for scalability

---

## Key Features (核心功能)

- **Intelligent AI Agent**: Multi-step reasoning powered by OpenAI Tool Calling.
- **Enterprise-Grade RBAC**: Role-based access control for secure ops.
- **Audit Logs & AI Analysis**: Full traceability with AI-powered diagnostics.
- **Modern UI**: Dark-themed Professional interface with Markdown & Syntax Highlighting.

---

## Tech Stack (技術棧)

- **Frontend**: React 19, Vite, Tailwind CSS, Zustand, React Router 7.
- **Backend**: NestJS, Drizzle ORM (PostgreSQL), OpenAI SDK.
- **Database**: PostgreSQL (Session & Audit persistence).
- **Types**: Shared TypeScript package `@ai-ops/types`.

---

## Documentation (文件說明)

For detailed design and operational instructions, please refer to the `docs` directory:
(詳細設計與操作說明請參閱 docs 目錄：)

- [API Documentation (API 介面文件)](docs/api.md)
- [Tool Registration Guide (工具註冊與擴展指南)](docs/tool-registration.md)

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

## Key Features & Roadmap (核心功能與技術路徑)

- [x] **Monorepo Architecture (Turborepo)**: Structured modular design with strong type-safety. (模組化架構，強型別約束。)
- [x] **Closed-Loop Reasoning**: AI autonomously decides tool calls and performs multi-step reasoning. (AI 自動決定工具調用與多步推理。)
- [x] **Asynchronous Execution (BullMQ)**: Job dispatching with BullMQ for scalable tool executions. (非同步任務派發與執行。)
- [x] **Enterprise-Grade RBAC**: Strict role-based access control for operations safety. (基於角色的嚴謹權限控管。)
- [x] **Audit Logs & Performance Monitoring**: Traceability, latency, and token usage analysis for every action. (AI 行為追蹤、耗時與 Token 分析。)
- [x] **AI-Driven Diagnostics**: Dynamic log analysis and automated repair suggestions. (動態日誌分析與修復建議。)

---

## Internal Tool Ecosystem (內建工具清單)

| Tool Name          | Description                                  | Access Level   |
| :----------------- | :------------------------------------------- | :------------- |
| `getJiraTasks`     | Fetch and filter high-priority tasks.        | All Roles      |
| `summarizeTasks`   | Statistical overview of current tasks.       | All Roles      |
| `sendNotification` | Trigger Slack/Email alerts.                  | Admin/Operator |
| `analyzeLogs`      | AI-driven diagnostic engine for system logs. | Admin/Operator |

---
