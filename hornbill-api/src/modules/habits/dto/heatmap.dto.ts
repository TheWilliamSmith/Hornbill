import { IsOptional, IsString, Matches } from 'class-validator';

export class HeatmapQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}$/, { message: 'year must be a 4-digit number' })
  year?: string;
}
