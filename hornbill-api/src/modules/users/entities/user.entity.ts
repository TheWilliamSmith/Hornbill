import { UserRole } from '@src/generated/prisma/enums';
import { ApiProperty } from '@nestjs/swagger';

export interface UserEntity {
  id: string;

  username: string;

  firstName: string;

  lastName: string;

  email: string;

  password: string;

  role: UserRole;

  createdAt: Date;

  updateAt: Date;
}
