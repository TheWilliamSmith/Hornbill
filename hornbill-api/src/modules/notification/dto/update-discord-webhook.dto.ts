import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateDiscordWebhookDto {
  @ApiProperty({
    description: 'Discord webhook URL (null to remove)',
    example: 'https://discord.com/api/webhooks/123456789/abcdef',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  @Matches(/^https:\/\/discord\.com\/api\/webhooks\/\d+\/.+$/, {
    message: 'Invalid Discord webhook URL format',
  })
  webhookUrl?: string | null;
}
