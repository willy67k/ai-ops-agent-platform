import type { ChatCompletionTool } from "openai/resources/index.mjs";

export const agentTools: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getJiraTasks",
      description:
        "Fetch a list of Jira tasks. Optionally filter by task status, priority, assignee, or label to get specific tasks.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description:
              'The status of the tasks to fetch (e.g., "To Do", "In Progress", "Done")',
          },
          priority: {
            type: "string",
            description:
              'The priority level of the tasks (e.g., "High", "Medium", "Low")',
          },
          assignee: {
            type: "string",
            description:
              'The name of the user assigned to the task (e.g., "Alice", "Bob")',
          },
          label: {
            type: "string",
            description:
              'A single label to filter tasks by (e.g., "security", "infra")',
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sendNotification",
      description:
        "Send a notification message to a specific recipient on Slack, Email or Teams.",
      parameters: {
        type: "object",
        required: ["message", "recipient"],
        properties: {
          message: {
            type: "string",
            description:
              "The content of the notification message that needs to be sent.",
          },
          recipient: {
            type: "string",
            description: "The identifier (email or username) of the recipient.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "summarizeTasks",
      description:
        "Summarize a list of Jira tasks. Provides a high-level overview of task distribution, priorities, and status counts.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: "Filter by status before summarizing.",
          },
          assignee: {
            type: "string",
            description: "Filter by assignee before summarizing.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyzeLogs",
      description:
        "AI-driven log diagnostics. Analyze raw log content to detect errors, warnings and suggest fixes.",
      parameters: {
        type: "object",
        required: ["logs"],
        properties: {
          logs: {
            type: "string",
            description: "The raw log content as a string to be analyzed.",
          },
          serviceName: {
            type: "string",
            description: "Optional name of the service the logs belong to.",
          },
        },
      },
    },
  },
];
