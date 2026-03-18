# AI Ops Agent Platform

An internal AI agent platform designed to automate operational workflows by integrating LLMs with tool-based execution and system orchestration.

> It is an extensible AI-powered internal operations platform.

---

## Overview

AI Ops Agent Platform is a fullstack application that demonstrates how Large Language Models (LLMs) can be integrated into internal systems to improve productivity, automate workflows, and assist decision-making.

Instead of a simple prompt-response chatbot, this system is built around a **tool-driven agent architecture**, enabling the AI to interact with internal services such as task management systems, notification services, and workflow engines.

---

## Key Features

### AI Agent (Tool Calling)

- Uses OpenAI API for LLM capabilities
- Supports **function/tool calling**
- Dynamically selects tools based on user intent
- Executes real system operations (not just text generation)

---

### Internal Tool Integration

The agent can interact with multiple internal tools:

- `getJiraTasks` → Fetch task data (Supports filtering by status, priority, assignee, and labels)
- `sendNotification` → Trigger notifications (Slack / Email mock)

---

### Workflow Orchestration

- Supports **contextual conversation** (Agent remembers previous messages)
- Supports **multi-step execution** via OpenAI tool calling loop
- Designed for **extensibility** (new tools can be added to `ToolsService` easily)

---

### Chat-based Interface

- Interactive UI (React)
- Real-time conversation with AI agent
- Displays tool execution logs for transparency

---

### Scalable Architecture

- Modular backend (NestJS)
- Tool abstraction layer
- Separation between:
  - Agent logic
  - Tool execution
  - Workflow orchestration

---

## Tech Stack

### Frontend

- React
- TypeScript

### Backend

- NestJS
- Node.js
- OpenAI API

### AI / Agent

- Tool Calling (OpenAI function calling)
- Prompt orchestration
- Agent execution loop

### Infra

- Docker
- REST API architecture

---

## Agent Design

This system follows a **tool-based agent architecture**:

1. User sends a request
2. LLM interprets intent
3. LLM decides which tool to call
4. Backend executes the tool
5. Results are returned to LLM
6. LLM generates final response

---

### Example Flow

**User Input:**

```
Summarize today's Jira tasks and assign high-priority ones
```

**Agent Execution:**

1. Call `getJiraTasks`
2. Call `summarizeTasks`
3. Call `classifyTasks`
4. Call `assignTask`

---

## Tool Example

```ts
export async function getJiraTasks() {
  return [
    { id: "JIRA-1", title: "Fix login bug", priority: "high" },
    { id: "JIRA-2", title: "Improve dashboard UI", priority: "low" },
  ];
}
```

---

## Workflow Design

The system is designed to support:

- Multi-step task execution
- Conditional branching (future extension)
- Integration with internal systems

This enables use cases such as:

- Automated support triage
- Incident response workflows
- Internal reporting automation

---

## Real-world Use Cases

- Customer support automation
- Internal task management optimization
- Engineering workflow acceleration
- AI-assisted operations (AI Ops)

---

## Future Improvements

- Persistent memory (conversation history)
- RAG (Retrieval-Augmented Generation)
- Multi-agent collaboration
- RBAC (Role-Based Access Control)
- Audit logging system
- Real Jira / Slack integration

---

## Design Philosophy

- **Tool-first, not prompt-first**
- **Composable architecture**
- **Extensible workflow system**
- **Production-oriented design (not demo-only)**

---

## Author

Built as part of a fullstack + AI engineering exploration focusing on:

- Internal platform systems
- AI-driven automation
- Scalable system design

---

## Notes

This project is a demonstration of integrating AI agents into real-world internal systems.
All external services (Jira, notifications) are mocked for demonstration purposes.

---

## Why This Project Matters

This project demonstrates:

- Real-world AI agent architecture
- Internal tooling system design
- Fullstack engineering capability
- Ability to work with ambiguity and evolving requirements
