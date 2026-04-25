import { apiClient } from "@/lib/api-client";

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export interface UpdateProfileData {
  username?: string;
  firstName?: string;
  lastName?: string;
}

export const userService = {
  getMe: () => apiClient.get<UserProfile>("users/me"),

  updateMe: (data: UpdateProfileData) =>
    apiClient.patch<UserProfile>("users/me", data),

  deleteAccount: (password: string) =>
    apiClient.delete("users/me", {
      json: { password },
    }),
};
