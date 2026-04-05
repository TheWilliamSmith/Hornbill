export interface createUserData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateSessionData {
  userId: string;
  refreshToken: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
}
