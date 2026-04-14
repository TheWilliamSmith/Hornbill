"use client";

import Input from "@/components/ui/Input";
import { SignupFormData, signupSchema } from "@/lib/schemas/auth.schema";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "./action";

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setApiError(null);
      await registerAction(data);
      router.push("/auth/login");
    } catch (error: unknown) {
      setApiError(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full max-w-lg p-4 border border-gray-300 rounded-lg">
      <h1 className="text-gray-500 text-2xl font-bold">Register Page</h1>
      <form
        className="flex flex-col gap-4 w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        {apiError && <p className="text-red-500 text-sm">{apiError}</p>}

        <Input
          type="text"
          label="Username"
          placeholder="Your username"
          className="border border-gray-500"
          error={errors.username?.message}
          {...register("username")}
        />

        <div className="flex gap-4">
          <Input
            type="text"
            label="First Name"
            placeholder="Your first name"
            className="border border-gray-500"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <Input
            type="text"
            label="Last Name"
            placeholder="Your last name"
            className="border border-gray-500"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <Input
          type="email"
          label="Email"
          placeholder="Your email"
          className="border border-gray-500"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          type="password"
          label="Password"
          placeholder="Your password"
          className="border border-gray-500"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          type="password"
          label="Confirm Password"
          placeholder="Confirm your password"
          className="border border-gray-500"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gray-500 text-white rounded py-2 hover:bg-gray-600 transition-colors"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <a className="text-gray-500" href="/auth/login">
          Login
        </a>
      </p>
    </div>
  );
}
