import { Module } from "@nestjs/common";
import { ToolsModule } from "./tools/tools.module.js";
import { AgentService } from "./agent.service.js";
import { AgentController } from "./agent.controller.js";

@Module({
  imports: [ToolsModule],
  controllers: [AgentController],
  providers: [AgentService],
  exports: [AgentService],
})
export class AgentModule {}
