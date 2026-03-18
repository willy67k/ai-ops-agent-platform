import { Body, Controller, Post, Get, Param } from "@nestjs/common";
import { AgentService } from "./agent.service.js";
import { ChatDto } from "./dto/chat.dto.js";
import { AppConfigService } from "../../config/config.service.js";
import type { ApiResponse, Conversation, Message, AuditLog } from "@ai-ops/types";

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
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const list = await this.agentService.getConversations();
    return {
      success: true,
      data: list as any,
    };
  }

  /**
   * 取得特定會話的訊息歷史
   */
  @Get("conversations/:id")
  async getConversationMessages(@Param("id") id: string): Promise<ApiResponse<Message[]>> {
    const messages = await this.agentService.getConversationMessages(id);
    return {
      success: true,
      data: messages as any,
    };
  }

  /**
   * 取得審核日誌 (僅限 admin)
   */
  @Get("audit-logs")
  async getAuditLogs(): Promise<ApiResponse<AuditLog[]>> {
    const logs = await this.agentService.getAuditLogs(this.configService.mockUserUsername);
    return {
      success: true,
      data: logs as any,
    };
  }

  /**
   * 對特定審核日誌執行 AI 分析
   */
  @Post("audit-logs/:id/analyze")
  async analyzeAuditLog(@Param("id") id: string): Promise<ApiResponse<string>> {
    const analysis = await this.agentService.analyzeOneAuditLog(id, this.configService.mockUserUsername);
    return {
      success: true,
      data: analysis || "",
    };
  }

  /**
   * 處理與 Agent 對話的 POST 請求
   */
  @Post("chat")
  async chat(@Body() chatDto: ChatDto): Promise<ApiResponse<string>> {
    const { message, history, conversationId } = chatDto;
    const result = await this.agentService.chat(message, history, conversationId);
    return {
      success: true,
      data: result.content || "",
      conversationId: result.conversationId,
    };
  }
}
