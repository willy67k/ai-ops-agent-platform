## Project Structure (Turborepo 專案目錄結構)

```bash
ai-ops-agent/
│
├─ packages/
│   ├─ frontend/                 # React App (Vite)
│   │   ├─ src/
│   │   │   ├─ components/
│   │   │   ├─ pages/
│   │   │   └─ store/
│   │   └─ index.html
│   │
│   ├─ backend/                  # NestJS Backend API
│   │   ├─ src/
│   │   │   ├─ modules/
│   │   │   │   ├─ agent/        # Core Agent API & LLM Memory
│   │   │   │   │   ├─ agent.controller.ts
│   │   │   │   │   └─ agent.service.ts
│   │   │   │   │
│   │   │   │   ├─ database/     # DB Setup & Drizzle Schema
│   │   │   │   │   └─ schema.ts
│   │   │   │   │
│   │   │   │   ├─ queue/        # BullMQ Tool Dispatcher & Worker
│   │   │   │   │
│   │   │   │   └─ demo/         # Optional Mock APIs
│   │   │   │
│   │   │   ├─ common/
│   │   │   └─ main.ts
│   │   └─ tsconfig.json
│   │
│   ├─ agent-core/               # AgentLoop Engine
│   │   └─ src/AgentLoop.ts
│   │
│   ├─ tool-registry/            # Shared JSON Schema Tools
│   │   └─ src/index.ts
│   │
│   ├─ types/                    # Shared Interfaces
│   │
│   ├─ queue/                    # Shared BullMQ Configuration
│   │
│   └─ observability/            # Logging & Tracing
│
├─ docs/                         # Documentation
├─ turbo.json
├─ package.json
└─ docker-compose.yml
```

---

## Folder Design Philosophy (目錄設計理念)

### packages/frontend (前端介面層)

- Pure UI layer with React 19 and Zustand. _(純 UI 層，基於 React 19 與 Zustand。)_
- No complex business logic. _(不包含複雜的業務邏輯。)_
- Talks only to Backend API. _(僅負責與後端 API 溝通。)_

---

### packages/backend (核心後端系統)

- Core system processing logic. _(系統核心處理邏輯。)_
- Contains: _(包含：)_
  - Agent Orchestration _(Agent 編排控管)_
  - Database Management (PostgreSQL via Drizzle) _(資料庫管理)_
  - Security & RBAC Validation _(權限與 RBAC 驗證)_
  - Queue Tools Dispatching _(工具的佇列派送)_

---

### packages/agent-core (推理環路核心)

- Isolated the `AgentLoop` away from the framework. _(將 `AgentLoop` 從主框架中抽離。)_
- Seamless conversational loops with LLMs. _(提供與 LLM 無縫串接的對話推理迴圈。)_

---

### packages/tool-registry (工具註冊表 / 最重要)

Every module inside the registry acts as an independent tool. _(註冊表內的每一個功能皆為獨立的模組。)_

Characteristics: _(優點：)_

- Plug & play _(隨插即用)_
- Highly testable _(高度可測試性)_
- Easily extensible _(極易擴展)_

---

### packages/types (共享型別)

- Shared contracts between frontend, backend, and core modules. _(提供前後端與核心模組之間的共用約束。)_
- Prevents data mismatch issues natively. _(從根本預防資料結構不匹配的問題。)_

---

## Turbo Pipeline (建議管線配置)

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false
    }
  }
}
```

---

## Scaling Strategy (擴展策略)

Future areas to expand: _(未來的擴展目標：)_

- Heavy tool execution shifted fully to Async BullMQ Workers. _(重型工具執行完全過渡到非同步的 BullMQ Worker。)_
- Event-driven notifications. _(事件驅動的通知機制。)_
- Multi-agent collaborative workflows. _(多 Agent 協同合作架構。)_

---

## Why This Structure? (為何採用此架構？)

This structure is precisely designed to: _(此架構專為達成以下目的而建置：)_

- Support AI agent evolution safely. _(安全地支援 AI Agent 演進。)_
- Enable rapid feature iteration. _(容許快速的功能疊代。)_
- Maintain clean separation of concerns. _(保持乾淨俐落的關注點分離。)_
- Be completely production-ready. _(確保已準備好進入生產環境。)_

---
