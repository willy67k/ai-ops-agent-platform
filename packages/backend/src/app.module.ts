import { Module } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { DemoModule } from "./modules/demo/demo.module.js";
import { AppConfigModule } from "./config/config.module.js";
import { AgentModule } from "./modules/agent/agent.module.js";
import { DatabaseModule } from "./modules/database/database.module.js";
import { QueueModule } from "./modules/queue/queue.module.js";

@Module({
  imports: [AppConfigModule, DemoModule, AgentModule, DatabaseModule, QueueModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
