import { Injectable, Logger } from "@nestjs/common";
import { MOCK_JIRA_TASKS } from "./mock-data.js";

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);

  /**
   * getJiraTasks: 負責取得 Jira 任務的工具實作
   */
  async getJiraTasks(args: { status?: string }) {
    this.logger.log(`Executing tool: getJiraTasks with args: ${JSON.stringify(args)}`);
    if (args.status) {
      return MOCK_JIRA_TASKS.filter((task: any) => task.status === args.status);
    }
    return MOCK_JIRA_TASKS;
  }

  /**
   * sendNotification: 負責發送通知的工具實作
   */
  async sendNotification(args: { message: string; recipient: string }) {
    this.logger.log(`Executing tool: sendNotification to ${args.recipient} with message: ${args.message}`);
    // 模擬實際發送邏輯，例如寄送 Email 或發送 Slack 訊息
    return { success: true, message: `Notification successfully sent to ${args.recipient}.` };
  }
}
