import OpenAI from "openai";
import { agentTools } from "@ai-ops/tool-registry";
import { createLogger } from "@ai-ops/observability";

const logger = createLogger("AgentLoop");

export interface AgentContext {
  model: string;
  systemPrompt: string;
  userMessage: string;
  history?: any[];
}

export interface StepObservation {
  toolName: string;
  arguments: Record<string, unknown>;
  result: any;
}

export type ToolExecutor = (name: string, args: Record<string, unknown>, context?: unknown) => Promise<any>;

export class AgentLoop {
  constructor(
    private openai: OpenAI,
    private executor: ToolExecutor
  ) {}

  async run(
    ctx: AgentContext,
    onStep?: (obs: StepObservation) => Promise<void>,
    executorContext?: unknown
  ): Promise<{ content: string; finalMessages: any[]; usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }> {
    const messages: any[] = [{ role: "system", content: ctx.systemPrompt }, ...(ctx.history || []), { role: "user", content: ctx.userMessage }];
    let totalUsage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    while (true) {
      const response = await this.openai.chat.completions.create({
        model: ctx.model,
        messages: messages as any,
        tools: agentTools as any,
        tool_choice: "auto",
      });

      if (response.usage) {
        totalUsage.prompt_tokens += response.usage.prompt_tokens || 0;
        totalUsage.completion_tokens += response.usage.completion_tokens || 0;
        totalUsage.total_tokens += response.usage.total_tokens || 0;
      }

      const responseMessage = response.choices[0].message;
      messages.push(responseMessage);

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.type !== "function") continue;

          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          logger.info(`AI 決定發起工具調用: ${functionName}`);

          // 透過注入的執行器執行工具 (例如 BullMQ dispatch)，包含上下文 (如角色)
          const toolResult = await this.executor(functionName, functionArgs, executorContext);

          if (onStep) {
            await onStep({
              toolName: functionName,
              arguments: functionArgs,
              result: toolResult,
            });
          }

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify(toolResult),
          });
        }
        continue;
      }

      return {
        content: responseMessage.content || "",
        finalMessages: messages,
        usage: totalUsage,
      };
    }
  }
}
