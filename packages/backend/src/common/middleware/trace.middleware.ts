import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "async_hooks";
import { v4 as uuidv4 } from "uuid";

export const traceContext = new AsyncLocalStorage<{ traceId: string }>();

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = (req.headers["x-trace-id"] as string) || uuidv4();
    res.setHeader("x-trace-id", traceId);

    traceContext.run({ traceId }, () => {
      next();
    });
  }
}
