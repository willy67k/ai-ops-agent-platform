import { Injectable, Logger, Inject } from "@nestjs/common";
import { AppConfigService } from "../../config/config.service.js";
import OpenAI from "openai";
import { DRIZZLE } from "../database/database.module.js";
import { conversations, messages as dbMessages, auditLogs, users } from "../database/schema.js";
import { eq, asc, desc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../database/schema.js";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue, QueueEvents } from "bullmq";
import { TOOL_QUEUE } from "../queue/queue.constants.js";
import { AgentLoop } from "@ai-ops/agent-core";

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  private openai: OpenAI;
  private agentLoop: AgentLoop;

  constructor(
    private configService: AppConfigService,
    @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
    @InjectQueue(TOOL_QUEUE) private toolQueue: Queue
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.openaiApiKey,
    });

    // 初始化核心 Reasoning 迴圈 (注入 Job Dispatcher 作為工具執行器)
    this.agentLoop = new AgentLoop(this.openai, async (name, args) => {
      this.logger.log(`[Queue Dispatch] 工具 ${name} 已加入任務佇列`);
      const job = await this.toolQueue.add(
        "execute-tool",
        { toolName: name, args },
        {
          attempts: 3,
          backoff: { type: "exponential", delay: 1000 },
        }
      );
      // 在此等候 BullMQ 執行結果
      const events = new QueueEvents(this.toolQueue.name, { connection: this.toolQueue.opts.connection });
      const result = await job.waitUntilFinished(events);
      events.close();
      return result;
    });
  }

  async getConversations() {
    return await this.db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async getConversationMessages(conversationId: string) {
    return await this.db.select({ role: dbMessages.role, content: dbMessages.content }).from(dbMessages).where(eq(dbMessages.conversationId, conversationId)).orderBy(asc(dbMessages.createdAt));
  }

  async getAuditLogs(username: string) {
    const [user] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user || user.role !== "admin") throw new Error("權限不足");
    return this.db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        toolName: auditLogs.toolName,
        input: auditLogs.input,
        output: auditLogs.output,
        status: auditLogs.status,
        createdAt: auditLogs.createdAt,
        username: users.username,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt));
  }

  async analyzeOneAuditLog(logId: string, username: string) {
    const [user] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    if (!user || (user.role !== "admin" && user.role !== "operator")) throw new Error("權限不足");

    const [log] = await this.db.select().from(auditLogs).where(eq(auditLogs.id, logId)).limit(1);
    if (!log) throw new Error("找不到該筆日誌。");

    const prompt = `分析日誌: ${log.toolName}, Input: ${JSON.stringify(log.input)}, Output: ${JSON.stringify(log.output)}, Status: ${log.status}`;
    const response = await this.openai.chat.completions.create({
      model: this.configService.openaiModel,
      messages: [{ role: "user", content: prompt }],
    });
    return response.choices[0].message.content;
  }

  async chat(message: string, history: any[] = [], conversationId?: string) {
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      const [newConv] = await this.db
        .insert(conversations)
        .values({ title: message.slice(0, 50) })
        .returning();
      currentConversationId = newConv.id;
    }

    await this.db.insert(dbMessages).values({ conversationId: currentConversationId, role: "user", content: message });

    const [currentUser] = await this.db.select().from(users).where(eq(users.username, this.configService.mockUserUsername)).limit(1);

    try {
      const { content } = await this.agentLoop.run(
        {
          model: this.configService.openaiModel,
          systemPrompt: "你是一個專業的 Cloud Ops 運維專家。協助使用者管理 Jira、分析日誌與發送通知。",
          userMessage: message,
          history,
        },
        async (obs) => {
          await this.db.insert(auditLogs).values({
            userId: currentUser?.id,
            action: "CALL_TOOL",
            toolName: obs.toolName,
            input: obs.arguments,
            output: obs.result,
            status: obs.result?.error ? "failed" : "success",
          });
        }
      );

      await this.db.insert(dbMessages).values({
        conversationId: currentConversationId,
        role: "assistant",
        content: content || "",
      });

      return { content, conversationId: currentConversationId };
    } catch (error: any) {
      this.logger.error(`Agent 執行失敗: ${error.message}`);
      return { content: `抱歉，系統發生錯誤：${error.message}`, conversationId: currentConversationId };
    }
  }
}
