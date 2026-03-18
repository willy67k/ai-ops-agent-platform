import { Injectable, Logger } from "@nestjs/common";
import { MOCK_JIRA_TASKS } from "./mock-data.js";

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  /**
   * getJiraTasks: 負責取得 Jira 任務的工具實作
   */
  getJiraTasks(args: { status?: string; priority?: string; assignee?: string; label?: string }) {
    this.logger.log(`Executing tool: getJiraTasks with args: ${JSON.stringify(args)}`);

    return MOCK_JIRA_TASKS.filter((task: any) => {
      if (args.status && task.status !== args.status) return false;
      if (args.priority && task.priority !== args.priority) return false;
      if (args.assignee && task.assignee !== args.assignee) return false;
      if (args.label && !task.labels.includes(args.label)) return false;
      return true;
    });
  }

  /**
   * sendNotification: 負責發送通知的工具實作
   */
  sendNotification(args: { message: string; recipient: string }) {
    this.logger.log(`Executing tool: sendNotification to ${args.recipient} with message: ${args.message}`);
    // 模擬實際發送邏輯，例如寄送 Email 或發送 Slack 訊息
    return { success: true, message: `Notification successfully sent to ${args.recipient}.` };
  }
}
