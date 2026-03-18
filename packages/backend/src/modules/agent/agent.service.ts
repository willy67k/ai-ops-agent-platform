import { Injectable, Logger, Inject } from "@nestjs/common";
import { AppConfigService } from "../../config/config.service.js";
import { ToolsService } from "./tools/tools.service.js";
import { agentTools } from "./tools/tools.schema.js";
import OpenAI from "openai";
import { DRIZZLE } from "../database/database.module.js";
import { conversations, messages as dbMessages, auditLogs, users } from "../database/schema.js";
import { eq, asc, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../database/schema.js";

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private openai: OpenAI;

  constructor(
    private configService: AppConfigService,
    private toolsService: ToolsService,
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>
  ) {
    // 初始化 OpenAI 客戶端
    this.openai = new OpenAI({
      apiKey: this.configService.openaiApiKey,
    });
  }

  /**
   * RBAC 權限檢查邏輯
   * @param userRole 使用者角色
   * @param toolName 欲呼叫的工具名稱
   */
  private canAccessTool(userRole: "admin" | "operator" | "viewer", toolName: string): boolean {
    const permissions = {
      admin: ["getJiraTasks", "sendNotification"],
      operator: ["getJiraTasks", "sendNotification"],
      viewer: ["getJiraTasks"], // Viewer 不能發送通知
    };
    return (permissions[userRole] || []).includes(toolName);
  }

  /**
   * 取得所有會話列表 (由新到舊)
   */
  async getConversations() {
    return await this.db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  /**
   * 取得特定會話的訊息紀錄
   */
  async getConversationMessages(conversationId: string) {
    return await this.db
      .select({
        role: dbMessages.role,
        content: dbMessages.content,
      })
      .from(dbMessages)
      .where(eq(dbMessages.conversationId, conversationId))
      .orderBy(asc(dbMessages.createdAt));
  }

  /**
   * 與 Agent 對話的主方法
   * @param message 使用者的輸入訊息
   * @param history 前端傳來的對話紀錄 (可選)
   * @param conversationId 對話會話 ID (可選)
   */
  async chat(message: string, history: any[] = [], conversationId?: string) {
    // 1. 確保對話會話存在
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const [newConv] = await this.db
        .insert(conversations)
        .values({ title: message.slice(0, 50) })
        .returning();
      currentConversationId = newConv.id;
    }

    // 2. 修剪對話歷史
    const MAX_HISTORY = 20;
    const truncatedHistory = history.length > MAX_HISTORY ? history.slice(history.length - MAX_HISTORY) : history;

    // 3. 初始化對話紀錄
    const messages: any[] = [
      {
        role: "system",
        content: `你是一個專業的 Cloud Ops 運維專家。
        你的任務是協助使用者管理 Jira 任務、檢查系統狀態並執行通知。
        規範：
        1. 回答必須專業且簡潔。
        2. 呼叫工具前，如果缺乏必要參數，請詢問使用者。
        3. 執行 sendNotification 時，請確認收件者與訊息內容是否正確。
        4. 如果工具執行失敗，請誠實告訴使用者原因並嘗試提供替代建議。`,
      },
      ...truncatedHistory,
      { role: "user", content: message },
    ];

    // 保存使用者訊息到資料庫
    await this.db.insert(dbMessages).values({
      conversationId: currentConversationId,
      role: "user",
      content: message,
    });

    // 5. 工具呼叫迴圈
    try {
      if (!this.configService.openaiApiKey) {
        throw new Error("尚未設定 OpenAI API Key");
      }

      // [模擬權限] 這裡我們先拿固定的 operator 使用者來示範 RBAC
      const [currentUser] = await this.db.select().from(users).where(eq(users.username, "operator_user")).limit(1);
      const userRole = currentUser?.role || "viewer";

      while (true) {
        const response = await this.openai.chat.completions.create({
          model: this.configService.openaiModel,
          messages: messages,
          tools: agentTools as any,
          tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;
        messages.push(responseMessage);

        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          for (const toolCall of responseMessage.tool_calls) {
            const functionName = (toolCall as any).function.name;
            const functionArgs = JSON.parse((toolCall as any).function.arguments);
            let toolResult;

            // --- RBAC 權限檢查 ---
            if (!this.canAccessTool(userRole as any, functionName)) {
              this.logger.warn(`使用者權限不足：無法執行 ${functionName}`);
              toolResult = { error: `您的權限為 ${userRole}，無法使用工具: ${functionName}` };
            } else {
              try {
                if (functionName === "getJiraTasks") {
                  toolResult = this.toolsService.getJiraTasks(functionArgs);
                } else if (functionName === "sendNotification") {
                  toolResult = this.toolsService.sendNotification(functionArgs);
                } else {
                  toolResult = { error: `未知的工具名稱: ${functionName}` };
                }
              } catch (toolError) {
                toolResult = { error: "工具內部執行失敗", details: toolError.message };
              }
            }

            // --- 審核日誌 (Audit Log) ---
            await this.db.insert(auditLogs).values({
              userId: currentUser?.id,
              action: "CALL_TOOL",
              toolName: functionName,
              input: functionArgs,
              output: toolResult as any,
              status: (toolResult as any)?.error ? "failed" : "success",
            });

            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: JSON.stringify(toolResult),
            });
          }
          continue;
        }

        // 保存助手回覆到資料庫
        await this.db.insert(dbMessages).values({
          conversationId: currentConversationId,
          role: "assistant",
          content: responseMessage.content || "",
        });

        return {
          content: responseMessage.content,
          conversationId: currentConversationId,
        };
      }
    } catch (error: any) {
      this.logger.error(`Agent 執行失敗: ${error.message}`);
      return {
        content: `抱歉，系統發生錯誤：${error.message}`,
        conversationId: currentConversationId,
      };
    }
  }
}
