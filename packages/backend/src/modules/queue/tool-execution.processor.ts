import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { TOOL_QUEUE } from "./queue.constants.js";
import { ToolsService } from "../agent/tools/tools.service.js";

interface ToolJobData {
  toolName: string;
  args: any;
}

@Processor(TOOL_QUEUE)
export class ToolExecutionProcessor extends WorkerHost {
  private readonly logger = new Logger(ToolExecutionProcessor.name);

  constructor(private readonly toolsService: ToolsService) {
    super();
  }

  async process(job: Job<ToolJobData>): Promise<any> {
    const { toolName, args } = job.data;
    this.logger.log(`Executing tool job: ${toolName} for job ID: ${job.id}`);

    try {
      let result: any;
      switch (toolName) {
        case "getJiraTasks":
          result = this.toolsService.getJiraTasks(args);
          break;
        case "sendNotification":
          result = this.toolsService.sendNotification(args);
          break;
        case "analyzeLogs":
          result = await this.toolsService.analyzeLogs(args);
          break;
        case "summarizeTasks":
          result = this.toolsService.summarizeTasks(args);
          break;
        default:
          throw new Error(`Unknown tool: ${toolName}`);
      }
      return result;
    } catch (error: any) {
      this.logger.error(`Failed to execute tool ${toolName}: ${error.message}`);
      throw error;
    }
  }
}
