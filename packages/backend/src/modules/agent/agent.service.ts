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
   */
  async chat(message: string) {
    // 1. 初始化對話紀錄
    const messages: any[] = [
      {
        role: "system",
        content: "你是一個專業的 Ops 專家，負責處理 Jira 任務並根據需要發送通知。請務必嚴謹執行任務。",
      },
      { role: "user", content: message },
    ];

    try {
      // 開始執行迴圈：AI 可能會多次要求呼叫工具，直到它準備好給出最終回答
      // eslint-disable-next-line no-constant-condition
      while (true) {
        // 2. 送出當前的對話紀錄給 OpenAI
        const response = await this.openai.chat.completions.create({
          model: "gpt-4o", // 或其他支援 Tool Calling 的模型
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

            // 4. 根據 AI 的要求執行對應的 Node.js 函式 (Mock)
            if (functionName === "getJiraTasks") {
              toolResult = await this.toolsService.getJiraTasks(functionArgs);
            } else if (functionName === "sendNotification") {
              toolResult = await this.toolsService.sendNotification(functionArgs);
            } else {
              toolResult = { error: "未知的工具名稱" };
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
    } catch (error) {
      this.logger.error(`Agent 執行失敗: ${error.message}`);
      throw error;
    }
  }
}
