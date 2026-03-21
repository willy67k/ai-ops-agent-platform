import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException ? exception.getResponse() : exception.message || "Internal server error";

    this.logger.error(`HTTP Status: ${status} Error: ${JSON.stringify(message)} Path: ${request.url}`);

    response.status(status).json({
      success: false,
      data: null,
      message: typeof message === "object" ? (message as any).message || JSON.stringify(message) : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
