"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/lib/auth/auth-types";
import * as authClient from "@/lib/auth/auth-client";
import { getToken, getStoredUser } from "@/lib/auth/auth-storage";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const stored = getStoredUser();
      if (stored) {
        setUser(stored);
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (data: LoginRequest) => {
    const res = await authClient.login(data);
    setUser(res.user);
  };

  const handleRegister = async (data: RegisterRequest) => {
    const res = await authClient.register(data);
    setUser(res.user);
  };

  const handleLogout = () => {
    authClient.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
