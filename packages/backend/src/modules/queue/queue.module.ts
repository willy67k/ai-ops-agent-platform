import { Module, Global } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { AppConfigService } from "../../config/config.service.js";
import { ToolsModule } from "../agent/tools/tools.module.js";
import { ToolExecutionProcessor } from "./tool-execution.processor.js";
import { TOOL_QUEUE } from "./queue.constants.js";

@Global()
@Module({
  imports: [
    ToolsModule,
    BullModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => {
        const url = new URL(config.redisUrl);
        return {
          connection: {
            host: url.hostname || "localhost",
            port: parseInt(url.port || "6379", 10),
            password: url.password,
          },
        };
      },
    }),
    BullModule.registerQueue({
      name: TOOL_QUEUE,
    }),
  ],
  providers: [ToolExecutionProcessor],
  exports: [BullModule],
})
export class QueueModule {}
