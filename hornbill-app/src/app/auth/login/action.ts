"use server";

import { cookies } from "next/headers";
import { LoginFormData } from "@/lib/schemas/auth.schema";

const API_URL = process.env.API_URL || "http://localhost:3000";

export async function loginAction(formData: LoginFormData) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

  (await cookies()).set("accessToken", data.accessToken, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15,
  });

  (await cookies()).set("refreshToken", data.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return data.user;
}
