import { IsOptional, IsIn, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

const STATUSES = ['PLAN_TO_READ', 'READING', 'COMPLETED', 'ON_HOLD', 'DROPPED'];

export class UpdateCollectionDto {
  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  ownedVolumes?: number[];

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Type(() => Number)
  readVolumes?: number[];
}
