import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { TOOL_QUEUE } from "./queue.constants.js";
import { ToolsService } from "../agent/tools/tools.service.js";
import { createLogger } from "@ai-ops/observability";

const baseLogger = createLogger("ToolExecutionProcessor");

interface ToolJobData {
  toolName: string;
  args: any;
  traceId?: string;
}

@Processor(TOOL_QUEUE)
export class ToolExecutionProcessor extends WorkerHost {
  constructor(private readonly toolsService: ToolsService) {
    super();
  }

  async process(job: Job<ToolJobData>): Promise<any> {
    const { toolName, args, traceId } = job.data;
    const logger = baseLogger.child({ toolName, jobId: job.id, traceId });

    logger.info(`開始執行工具任務: ${toolName}`);

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
      logger.info(`工具任務執行成功: ${toolName}`);
      return result;
    } catch (error: any) {
      logger.error(`工具任務執行失敗: ${toolName}, Error: ${error.message}`);
      throw error;
    }
  }
}
