import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';

export class UpdateListDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsBoolean()
  isCollapsed?: boolean;

  @IsOptional()
  @IsString()
  parentId?: string | null;
}
