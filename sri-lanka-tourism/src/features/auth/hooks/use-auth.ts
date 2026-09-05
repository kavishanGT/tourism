"use client";

import { useMutation } from "@tanstack/react-query";
import { useAuthContext } from "../context/auth-context";
import type { LoginRequest, RegisterRequest } from "@/lib/auth/auth-types";

export function useAuth() {
  const context = useAuthContext();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => context.login(data),
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => context.register(data),
  });

  return {
    ...context,
    loginMutation,
    registerMutation,
  };
}
