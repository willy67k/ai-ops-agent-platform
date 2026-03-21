import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(private config: ConfigService) {}

  get port(): number {
    return this.config.get<number>("PORT", 6890);
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

  get openaiModel(): string {
    return this.config.get<string>("OPENAI_MODEL", "gpt-4o-mini");
  }

  get mockUserUsername(): string {
    return this.config.get<string>("MOCK_USER_USERNAME", "operator_user");
  }

  get redisUrl(): string {
    return this.config.get<string>("REDIS_URL", "redis://localhost:6379");
  }
}
