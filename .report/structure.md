## Project Structure (Turborepo)

```bash
ai-ops-agent/
│
├─ apps/
│   ├─ web/                      # React App (Vite)
│   │   ├─ src/
│   │   │   ├─ pages/
│   │   │   │   └─ Chat.tsx
│   │   │   │
│   │   │   ├─ components/
│   │   │   │   ├─ ChatWindow.tsx
│   │   │   │   ├─ MessageBubble.tsx
│   │   │   │   ├─ InputBox.tsx
│   │   │   │   └─ ToolLogPanel.tsx
│   │   │   │
│   │   │   ├─ hooks/
│   │   │   │   └─ useChat.ts
│   │   │   │
│   │   │   ├─ services/
│   │   │   │   └─ agentApi.ts
│   │   │   │
│   │   │   ├─ store/            # Zustand / Redux
│   │   │   │   └─ chat.store.ts
│   │   │   │
│   │   │   └─ main.tsx
│   │   │
│   │   └─ index.html
│   │
│   ├─ api/                      # NestJS Backend
│   │   ├─ src/
│   │   │   ├─ modules/
│   │   │   │
│   │   │   │   ├─ agent/
│   │   │   │   │   ├─ agent.controller.ts
│   │   │   │   │   ├─ agent.service.ts
│   │   │   │   │   ├─ agent.types.ts
│   │   │   │   │   └─ agent.prompt.ts
│   │   │   │   │
│   │   │   │   ├─ tools/
│   │   │   │   │   ├─ tool.registry.ts
│   │   │   │   │   ├─ tool.types.ts
│   │   │   │   │   ├─ tool.executor.ts
│   │   │   │   │   │
│   │   │   │   │   ├─ jira/
│   │   │   │   │   │   └─ jira.tool.ts
│   │   │   │   │   │
│   │   │   │   │   ├─ task/
│   │   │   │   │   │   ├─ summarize.tool.ts
│   │   │   │   │   │   ├─ classify.tool.ts
│   │   │   │   │   │   └─ assign.tool.ts
│   │   │   │   │   │
│   │   │   │   │   └─ notify/
│   │   │   │   │       └─ notify.tool.ts
│   │   │   │   │
│   │   │   │   ├─ workflow/
│   │   │   │   │   ├─ workflow.service.ts
│   │   │   │   │   └─ workflow.types.ts
│   │   │   │   │
│   │   │   │   ├─ auth/          # 可選
│   │   │   │   │   └─ rbac.guard.ts
│   │   │   │   │
│   │   │   │   └─ common/
│   │   │   │       ├─ logger.ts
│   │   │   │       └─ exceptions.ts
│   │   │   │
│   │   │   └─ main.ts
│   │   │
│   │   └─ tsconfig.json
│
├─ packages/
│   ├─ types/                    # Shared Types
│   │   └─ agent.ts
│   │
│   ├─ ui/                       # 可選共用 UI
│   │
│   └─ config/                   # eslint / tsconfig
│
├─ turbo.json
├─ package.json
└─ docker-compose.yml
```

---

## Folder Design Philosophy

### apps/web

- Pure UI layer
- No business logic
- Talks only to API

---

### apps/api

- Core system
- Contains:
  - Agent
  - Tools
  - Workflow
  - Security

---

### packages/types

- Shared contracts between frontend/backend
- Prevents mismatch

---

### tools/\* (最重要)

每個 tool 都是「獨立模組」

好處：

- 可插拔（plug & play）
- 可測試
- 可擴展

---

## Turbo Pipeline（建議）

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

## Scaling Strategy

未來可以擴展：

- Worker queue（BullMQ）
- Tool execution async 化
- Multi-agent system
- Event-driven architecture

---

## Why This Structure?

This structure is designed to:

- Support AI agent evolution
- Enable rapid feature iteration
- Maintain clean separation of concerns
- Be production-ready, not just demo

---
