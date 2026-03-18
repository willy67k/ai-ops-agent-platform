## System Architecture

```text
                        ┌────────────────────────────┐
                        │        React Client         │
                        │  (Chat UI + Tool Logs UI)   │
                        └─────────────┬──────────────┘
                                      │ HTTP (REST)
                                      ▼
                        ┌────────────────────────────┐
                        │        API Gateway          │
                        │   (NestJS Controllers)      │
                        └─────────────┬──────────────┘
                                      │
             ┌────────────────────────┼────────────────────────┐
             ▼                        ▼                        ▼
 ┌────────────────────┐   ┌────────────────────┐   ┌────────────────────┐
 │   Agent Layer       │   │ Workflow Engine     │   │  Auth / RBAC       │
 │ (LLM Orchestration) │   │ (Task Orchestration)│   │ (Permission Check) │
 └─────────┬──────────┘   └─────────┬──────────┘   └─────────┬──────────┘
           │                        │                        │
           ▼                        ▼                        ▼
 ┌──────────────────────────────────────────────────────────────┐
 │                      Tool Execution Layer                     │
 │  - Tool Registry                                              │
 │  - Tool Dispatcher                                            │
 │  - Tool Result Normalizer                                     │
 └───────────────┬───────────────────────────────┬──────────────┘
                 │                               │
     ┌───────────▼──────────┐         ┌──────────▼──────────┐
     │ Internal Services     │         │ External Services    │
     │ (Mock / Real APIs)    │         │ (3rd Party APIs)     │
     │                       │         │                      │
     │ - Jira Service        │         │ - OpenAI API         │
     │ - Notification (Lark) │         │ - Slack API          │
     │ - Task DB             │         │                      │
     └───────────────────────┘         └──────────────────────┘
```

---

## Core Layers Explained

### Agent Layer (LLM Orchestration)

- Responsible for:
  - Understanding user intent
  - Selecting tools
  - Managing tool-calling loop

- Implements:
  - Prompt strategy
  - Tool schema definition
  - Response synthesis

---

### Workflow Engine

- Handles multi-step task execution
- Supports:
  - Sequential execution
  - Conditional branching (future)

- Example:
  - Fetch tasks → classify → assign → notify

---

### Tool Execution Layer

- Central abstraction for all tools
- Responsibilities:
  - Tool registration
  - Input validation
  - Execution routing
  - Result normalization

**Key Design: decouple LLM from business logic**

---

### Auth / RBAC Layer (Optional but recommended)

- Controls:
  - Who can trigger which tools
  - Prevents unsafe operations

- Useful for:
  - Internal platform security
  - Audit readiness

---

### Observability

- Tool execution logs
- Agent decision logs
- Error tracing

---

## Data Flow (Execution Flow)

```text
User Input
   ↓
Agent (LLM decides)
   ↓
Tool Call (structured)
   ↓
Tool Execution Layer
   ↓
Internal Service / API
   ↓
Tool Result
   ↓
Agent (final response)
   ↓
Frontend UI
```

---

## Design Principles

- Tool-first architecture (NOT prompt-only)
- Decoupled agent & tools
- Extensible system (plug new tools easily)
- Production-oriented (not just demo)
- Observable & debuggable
