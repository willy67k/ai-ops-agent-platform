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
      const toolMethod = (this.toolsService as any)[toolName];
      if (!toolMethod || typeof toolMethod !== "function") {
        throw new Error(`找不到對應的工具實作: ${toolName}`);
      }

      const result = await toolMethod.call(this.toolsService, args);
      logger.info(`工具任務執行成功: ${toolName}`);
      return result;
    } catch (error: any) {
      logger.error(`工具任務執行失敗: ${toolName}, Error: ${error.message}`);
      throw error;
    }
  }
}
