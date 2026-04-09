import { UserRole } from '@src/generated/prisma/enums';

export interface User {
  id: string;

  username: string;

  firstName: string;

  lastName: string;

  email: string;

  role: UserRole;

  isVerified: boolean;

  lastLogin: Date | null;

  deletedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;
}
