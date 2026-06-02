"use client";

import { AuthForm } from "@/components/auth-form";
import { api } from "@/lib/api";

export function SignupClient() {
  return (
    <AuthForm
      mode="signup"
      onSubmit={async (data) => {
        const result = await api.signup(data);
        return { devVerifyUrl: result.devVerifyUrl };
      }}
    />
  );
}
