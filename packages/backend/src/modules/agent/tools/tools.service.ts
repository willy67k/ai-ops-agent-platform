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

  /**
   * analyzeLogs: 負責分析日誌內容的工具實作
   */
  async analyzeLogs(args: { logs: string; serviceName?: string }) {
    this.logger.log(`Executing tool: analyzeLogs for service: ${args.serviceName || "unknown"}`);

    const lines = args.logs.split("\n");
    const errors = lines.filter((line) => line.toUpperCase().includes("ERROR"));
    const warnings = lines.filter((line) => line.toUpperCase().includes("WARN"));

    return {
      success: true,
      service: args.serviceName || "Global",
      totalLines: lines.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      criticalErrors: errors.slice(0, 5), // 僅回傳前 5 筆錯誤
      summary: errors.length > 0 ? `偵測到 ${errors.length} 個錯誤，建議優先檢查。` : warnings.length > 0 ? `偵測到 ${warnings.length} 個警告，請留意潛在風險。` : "未偵測到明顯異常。",
    };
  }
}
