import { IsNotEmpty, IsString } from "class-validator";

/**
 * 送出對話請求的資料傳輸物件 (DTO)
 */
export class ChatDto {
  @IsString({ message: "訊息必須是字串" })
  @IsNotEmpty({ message: "訊息不能為空" })
  message: string;
}
