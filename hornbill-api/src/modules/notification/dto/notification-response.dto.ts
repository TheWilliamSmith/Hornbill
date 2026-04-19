import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@src/generated/prisma/enums';

export class NotificationResponseDto {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ type: String })
  title: string;

  @ApiProperty({ type: String })
  message: string;

  @ApiProperty({ type: Object, required: false })
  data: Record<string, unknown> | null;

  @ApiProperty({ type: Boolean })
  isRead: boolean;

  @ApiProperty({ type: Date })
  createdAt: Date;
}
