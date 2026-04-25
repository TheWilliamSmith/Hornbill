"use server";

import { cookies } from "next/headers";
import { LoginFormData } from "@/lib/schemas/auth.schema";

const API_URL = process.env.API_URL || "http://localhost:3000";

export async function loginAction(formData: LoginFormData) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  let data: {
    accessToken?: string;
    refreshToken?: string;
    user?: unknown;
    message?: string;
  };
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Login failed",
    );
  }

  if (!data.accessToken || !data.refreshToken) {
    throw new Error("Invalid response from server");
  }

  (await cookies()).set("accessToken", data.accessToken, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15,
  });

  // Store refresh token in both httpOnly (secure) and non-httpOnly (for API calls)
  (await cookies()).set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  (await cookies()).set("refreshTokenClient", data.refreshToken, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return data.user;
}
