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
  analyzeLogs(args: { logs: string; serviceName?: string }) {
    this.logger.log(`Executing tool: analyzeLogs for service: ${args.serviceName || "unknown"}`);

    const lines = args.logs.split("\n");
    const errors = lines.filter((line) => line.toUpperCase().includes("ERROR"));
    const warnings = lines.filter((line) => line.toUpperCase().includes("WARN"));

    const errorPatterns = [
      { pattern: /DB_CONNECTION/i, diagnosis: "資料庫連線超時", suggestion: "請檢查 PostgreSQL 容器狀態與 DATABASE_URL 配置。" },
      { pattern: /REDIS_ERROR/i, diagnosis: "Redis 連線失敗", suggestion: "請檢查 Redis 伺服器是否啟動或密碼是否正確。" },
      { pattern: /OPENAI_API_ERROR/i, diagnosis: "OpenAI API 異常", suggestion: "請檢查 OpenAI API Key 或網路連線是否通暢。" },
      { pattern: /ECONNREFUSED/i, diagnosis: "服務拒絕連線", suggestion: "可能是下游客服端服務未啟動，請檢查 Service Mesh 狀態。" },
    ];

    const diagnosisList = errors.map((err: string) => {
      const match = errorPatterns.find((p) => p.pattern.test(err));
      return match ? { error: err, diagnosis: match.diagnosis, suggestion: match.suggestion } : { error: err, diagnosis: "未知錯誤", suggestion: "建議手動分析原始日誌內容。" };
    });

    return {
      success: true,
      service: args.serviceName || "Global",
      totalLines: lines.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      analysisResult: diagnosisList.slice(0, 10), // 回傳前 10 筆具體分析
      overallSummary: errors.length > 0 ? `偵測到 ${errors.length} 個錯誤。初步分析發現 ${[...new Set(diagnosisList.map((d: any) => d.diagnosis))].join(", ")} 等異常情境。` : "未偵測到明顯異常。",
    };
  }

  /**
   * summarizeTasks: 負責統計並摘要任務列表的工具實作
   */
  summarizeTasks(args: { status?: string; assignee?: string }) {
    this.logger.log(`Executing tool: summarizeTasks with args: ${JSON.stringify(args)}`);

    const tasks = this.getJiraTasks(args);
    const statusCount = tasks.reduce<Record<string, number>>((acc, task: any) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const priorityCount = tasks.reduce<Record<string, number>>((acc, task: any) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      success: true,
      totalCount: tasks.length,
      statusBreakdown: statusCount,
      priorityBreakdown: priorityCount,
      summary: `目前共有 ${tasks.length} 筆任務。${Object.entries(statusCount)
        .map(([s, c]) => `${s}: ${c}`)
        .join(", ")}。`,
    };
  }
}
