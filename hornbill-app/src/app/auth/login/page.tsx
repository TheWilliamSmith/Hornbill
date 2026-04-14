"use client";

import Input from "@/components/ui/Input";
import { LoginFormData, loginSchema } from "@/lib/schemas/auth.schema";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "./action";

export default function LoginPage() {
  const router = useRouter();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setApiError(null);
      await loginAction(data);
      router.push("/");
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-lg p-4 border border-gray-300 rounded-lg">
      <h1 className="text-gray-500 text-2xl font-bold">Login Page</h1>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full">
          {apiError && <p className="text-red-500 text-sm mb-2">{apiError}</p>}
          <Input
            type="email"
            label="Email"
            placeholder="Your email"
            required={true}
            className=" border border-gray-500"
            {...register("email")}
          />
        </div>
        <div className="w-full">
          <Input
            type="password"
            label="Password"
            placeholder="Your password"
            required={true}
            className="border border-gray-500"
            {...register("password")}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gray-500 text-white rounded py-2 hover:bg-gray-600 transition-colors"
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p>
        New Here ?{" "}
        <a className="text-gray-500" href="/auth/register">
          Create an account
        </a>
      </p>
    </div>
  );
}
