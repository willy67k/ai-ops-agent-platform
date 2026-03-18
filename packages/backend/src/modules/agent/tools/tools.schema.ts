export const agentTools = [
  {
    type: "function",
    function: {
      name: "getJiraTasks",
      description: "Fetch a list of Jira tasks. Optionally filter by task status to get specific tasks.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description: 'The status of the tasks to fetch (e.g., "To Do", "In Progress", "Done")',
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "sendNotification",
      description: "Send a notification message to a specific recipient on Slack, Email or Teams.",
      parameters: {
        type: "object",
        required: ["message", "recipient"],
        properties: {
          message: {
            type: "string",
            description: "The content of the notification message that needs to be sent.",
          },
          recipient: {
            type: "string",
            description: "The identifier (email or username) of the recipient.",
          },
        },
      },
    },
  },
];
