import { Injectable, Logger } from "@nestjs/common";
import { AppConfigService } from "../../config/config.service.js";
import { ToolsService } from "./tools/tools.service.js";
import { agentTools } from "./tools/tools.schema.js";
import OpenAI from "openai";

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private openai: OpenAI;

  constructor(
    private configService: AppConfigService,
    private toolsService: ToolsService
  ) {
    // 初始化 OpenAI 客戶端
    this.openai = new OpenAI({
      apiKey: this.configService.openaiApiKey,
    });
  }

  /**
   * 與 Agent 對話的主方法
   * @param message 使用者的輸入訊息
   * @param history 之前的對話紀錄
   */
  async chat(message: string, history: { role: "user" | "assistant"; content: string }[] = []) {
    // 1. 修剪對話歷史 (避免 Token 溢出，保留最近 10 輪，即 20 則訊息)
    const MAX_HISTORY = 20;
    const truncatedHistory = history.length > MAX_HISTORY ? history.slice(history.length - MAX_HISTORY) : history;

    // 2. 初始化對話紀錄與優化 System Prompt
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

    try {
      // 檢查 API Key 是否存在
      if (!this.configService.openaiApiKey) {
        throw new Error("尚未設定 OpenAI API Key，請檢查環境變數配置。");
      }

      // 開始執行迴圈：AI 可能會多次要求呼叫工具，直到它準備好給出最終回答
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // 2. 送出當前的對話紀錄給 OpenAI
        const response = await this.openai.chat.completions.create({
          model: this.configService.openaiModel,
          messages: messages,
          tools: agentTools as any,
          tool_choice: "auto",
        });

        const responseMessage = response.choices[0].message;

        // 將 AI 的回覆加入對話紀錄（包含可能的 tool_calls）
        messages.push(responseMessage);

        // 3. 檢查是否有 Tool Calling 要求
        if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
          this.logger.log(`AI 請求執行工具：${responseMessage.tool_calls.length} 個要求`);

          for (const toolCall of responseMessage.tool_calls) {
            const functionName = (toolCall as any).function.name;
            const functionArgs = JSON.parse((toolCall as any).function.arguments);

            let toolResult;

            try {
              // 4. 根據 AI 的要求執行對應的 Node.js 函式 (Mock)
              if (functionName === "getJiraTasks") {
                toolResult = this.toolsService.getJiraTasks(functionArgs);
              } else if (functionName === "sendNotification") {
                toolResult = this.toolsService.sendNotification(functionArgs);
              } else {
                toolResult = { error: `未知的工具名稱: ${functionName}` };
              }
            } catch (toolError) {
              this.logger.error(`工具執行發生異常: ${toolError.message}`);
              toolResult = { error: "工具內部執行失敗", details: toolError.message };
            }

            this.logger.log(`工具 ${functionName} 執行完畢，結果：${JSON.stringify(toolResult)}`);

            // 5. 將工具執行結果回傳給 OpenAI
            messages.push({
              tool_call_id: toolCall.id,
              role: "tool",
              name: functionName,
              content: JSON.stringify(toolResult),
            });
          }
          // 繼續迴圈，讓 AI 根據工具結果生成下一步的內容
          continue;
        }

        // 如果沒有 tool_calls，代表 AI 已經給出最終文字回答
        return responseMessage.content;
      }
    } catch (error: any) {
      this.logger.error(`Agent 執行失敗: ${error.message}`);

      // 根據錯誤類型提供更友善的回覆
      if (error?.status === 401 || error?.message?.includes("API key")) {
        return "抱歉，目前 AI 服務的金鑰似乎無效或已過期，請聯絡系統管理員檢查後端設定。";
      }

      return `抱歉，我在處理您的請求時遇到了一個錯誤：${error.message}`;
    }
  }
}
