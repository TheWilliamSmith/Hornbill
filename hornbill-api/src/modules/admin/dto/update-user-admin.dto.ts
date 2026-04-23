import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '@src/generated/prisma/enums';

export class UpdateUserAdminDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
