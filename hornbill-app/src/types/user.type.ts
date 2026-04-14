export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  lastLogin: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}
