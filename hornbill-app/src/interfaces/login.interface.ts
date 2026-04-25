import { User } from "@/types/user.type";

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
