import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

const STATUSES = ['PLAN_TO_READ', 'READING', 'COMPLETED', 'ON_HOLD', 'DROPPED'];

export class AddToCollectionDto {
  @IsString()
  mangaReferenceId: string;

  @IsOptional()
  @IsIn(STATUSES)
  status?: string;

  @IsOptional()
  @IsBoolean()
  importAllVolumes?: boolean;
}
