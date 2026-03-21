import pino from "pino";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
          translateTime: "SYS:standard",
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
});

export const createLogger = (name: string) => logger.child({ module: name });

/**
 * 追蹤 ID 管理 (基於 AsyncLocalStorage 可實現於 backend 層)
 * 這裏僅導出類型或輔助屬性
 */
export interface TraceContext {
  traceId: string;
  userId?: string;
}
