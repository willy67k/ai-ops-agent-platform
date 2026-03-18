export enum UserRole {
  ADMIN = "admin",
  DEVELOPER = "developer",
  VIEWER = "viewer",
}

export interface IChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_call_id?: string;
}
