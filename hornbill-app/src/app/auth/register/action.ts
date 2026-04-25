"use server";

import { SignupFormData } from "@/lib/schemas/auth.schema";

const API_URL = process.env.API_URL || "http://localhost:3000";

export async function registerAction(formData: SignupFormData) {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  let data: { message?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server error (${res.status})`);
  }

  if (!res.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Registration failed",
    );
  }

  return data;
}
