import { UserRole } from '@src/generated/prisma/enums';

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  lastLogin: Date | null;
  deletedAt: Date | null;
  deactivatedAt: Date | null;
  deactivatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
