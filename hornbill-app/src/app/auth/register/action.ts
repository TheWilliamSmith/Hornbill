"use server";

import { SignupFormData } from "@/lib/schemas/auth.schema";

const API_URL = process.env.API_URL || "http://localhost:3000";

export type RegisterResult =
  | { success: true }
  | { success: false; error: string };

export async function registerAction(
  formData: SignupFormData,
): Promise<RegisterResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } catch {
    return {
      success: false,
      error: "Unable to reach the server. Please try again.",
    };
  }

  let data: { message?: string | string[] };
  try {
    data = await res.json();
  } catch {
    return { success: false, error: `Server error (${res.status})` };
  }

  if (!res.ok) {
    return {
      success: false,
      error: Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Registration failed",
    };
  }

  return { success: true };
}
