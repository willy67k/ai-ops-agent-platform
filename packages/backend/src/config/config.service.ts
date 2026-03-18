import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private config: ConfigService) {}

  get port(): number {
    return this.config.get<number>("PORT", 6970);
  }

  get frontendUrl(): string {
    return this.config.get<string>("FRONTEND_URL", "http://localhost:6969");
  }

  get nodeEnv(): string {
    return this.config.get<string>("NODE_ENV", "development");
  }

  get isProduction(): boolean {
    return this.nodeEnv === "production";
  }

  get isVercel(): boolean {
    return !!(this.config.get("VERCEL") || this.config.get("VITE_VERCEL_ENV"));
  }

  get openaiApiKey(): string {
    return this.config.get<string>("OPENAI_API_KEY", "");
  }
}
