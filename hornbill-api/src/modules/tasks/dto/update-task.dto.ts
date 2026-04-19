import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isDone?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsString()
  listId?: string;
}
