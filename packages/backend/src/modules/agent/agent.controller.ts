import { Body, Controller, Post, Get, Param } from "@nestjs/common";
import { AgentService } from "./agent.service.js";
import { ChatDto } from "./dto/chat.dto.js";
import { AppConfigService } from "../../config/config.service.js";

/**
 * Agent 控制器：提供前端呼叫 AI Agent 的 API 接口
 */
@Controller("agent")
export class AgentController {
  constructor(
    private readonly agentService: AgentService,
    private readonly configService: AppConfigService
  ) {}

  /**
   * 取得所有會話列表
   */
  @Get("conversations")
  async getConversations() {
    const list = await this.agentService.getConversations();
    return {
      success: true,
      data: list,
    };
  }

  /**
   * 取得特定會話的訊息歷史
   */
  @Get("conversations/:id")
  async getConversationMessages(@Param("id") id: string) {
    const messages = await this.agentService.getConversationMessages(id);
    return {
      success: true,
      data: messages,
    };
  }

  /**
   * 取得審核日誌 (僅限 admin)
   */
  @Get("audit-logs")
  async getAuditLogs() {
    // 這裡我們先模擬權限 check，從環境變數取得 Mock User
    const logs = await this.agentService.getAuditLogs(this.configService.mockUserUsername);
    return {
      success: true,
      data: logs,
    };
  }

  /**
   * 處理與 Agent 對話的 POST 請求
   * @param chatDto 包含使用者訊息的資料
   */
  @Post("chat")
  async chat(@Body() chatDto: ChatDto) {
    const { message, history, conversationId } = chatDto;
    const result = await this.agentService.chat(message, history, conversationId);
    return {
      success: true,
      message: result.content,
      conversationId: result.conversationId,
    };
  }
}
