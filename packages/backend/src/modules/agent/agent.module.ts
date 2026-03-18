import { Module } from "@nestjs/common";
import { ToolsService } from "./tools/tools.service.js";
import { AgentService } from "./agent.service.js";
import { AgentController } from "./agent.controller.js";

@Module({
  controllers: [AgentController],
  providers: [ToolsService, AgentService],
  exports: [ToolsService, AgentService],
})
export class AgentModule {}
