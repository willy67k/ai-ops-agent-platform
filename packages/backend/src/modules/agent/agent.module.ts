import { Module } from "@nestjs/common";
import { ToolsService } from "./tools/tools.service.js";
import { AgentService } from "./agent.service.js";

@Module({
  providers: [ToolsService, AgentService],
  exports: [ToolsService, AgentService],
})
export class AgentModule {}
