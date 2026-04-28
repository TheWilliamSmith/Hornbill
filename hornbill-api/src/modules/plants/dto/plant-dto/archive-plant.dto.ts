import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ArchiveReason } from '@src/generated/prisma/enums';

export class ArchivePlantDto {
  @ApiProperty({ enum: ArchiveReason, example: ArchiveReason.DEAD })
  @IsEnum(ArchiveReason)
  archiveReason: ArchiveReason;
}
