import { Body, Controller, Post } from "@nestjs/common";
import { AgentService } from "./agent.service.js";
import { ChatDto } from "./dto/chat.dto.js";

/**
 * Agent 控制器：提供前端呼叫 AI Agent 的 API 接口
 */
@Controller("agent")
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  /**
   * 處理與 Agent 對話的 POST 請求
   * @param chatDto 包含使用者訊息的資料
   */
  @Post("chat")
  async chat(@Body() chatDto: ChatDto) {
    const result = await this.agentService.chat(chatDto.message);
    return {
      success: true,
      message: result,
    };
  }
}
