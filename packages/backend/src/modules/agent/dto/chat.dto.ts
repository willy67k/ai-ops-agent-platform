import { IsArray, IsNotEmpty, IsOptional, IsString } from "class-validator";

/**
 * 送出對話請求的資料傳輸物件 (DTO)
 */
export class ChatDto {
  @IsString({ message: "訊息必須是字串" })
  @IsNotEmpty({ message: "訊息不能為空" })
  message: string;

  @IsArray({ message: "歷史紀錄格式不正確" })
  @IsOptional()
  history?: { role: "user" | "assistant"; content: string }[];

  @IsOptional()
  conversationId?: string;

  @IsOptional()
  dryRun?: boolean;

  /**
   * AI 角色身分 (可選, 例如 SRE, Dev)
   */
  @IsString()
  @IsOptional()
  agentRole?: string;
}
