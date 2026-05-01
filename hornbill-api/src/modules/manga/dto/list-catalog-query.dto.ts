import { IsOptional, IsString, IsInt, IsIn, IsBoolean, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ListCatalogQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['PUBLISHING', 'FINISHED', 'CANCELLED', 'HIATUS', 'NOT_YET_RELEASED'])
  status?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minVolumes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxVolumes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  minScore?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  maxScore?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeAdult?: boolean;

  @IsOptional()
  @IsIn([
    'popularity',
    'averageScore',
    'favourites',
    'titleRomaji',
    'startYear',
    'volumes',
    'chapters',
    'updatedAt',
  ])
  sortBy?: string = 'popularity';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: string = 'desc';
}
