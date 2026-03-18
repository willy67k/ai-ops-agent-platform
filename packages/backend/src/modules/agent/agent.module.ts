import { Module } from "@nestjs/common";
import { ToolsService } from "./tools/tools.service.js";

@Module({
  providers: [ToolsService],
  exports: [ToolsService],
})
export class AgentModule {}
