import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type { LoginRequest, RegisterRequest, AuthResponse, AuthUser } from "./auth-types";
import { saveToken, saveRefreshToken, getRefreshToken, clearToken, saveUser, getStoredUser } from "./auth-storage";

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data);
  const result = response.data.data;
  saveToken(result.accessToken);
  saveRefreshToken(result.refreshToken);
  saveUser(result.user);
  return result;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data);
  const result = response.data.data;
  saveToken(result.accessToken);
  saveRefreshToken(result.refreshToken);
  saveUser(result.user);
  return result;
}

export function logout(): void {
  clearToken();
}

/**
 * Silently refresh the access token using the stored refresh token.
 * Returns the new access token string, or null if refresh fails.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;
  try {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      "/auth/refresh",
      { refresh_token: refreshToken },
      { _skipRefresh: true } as any // prevent interceptor loop
    );
    const result = response.data.data;
    saveToken(result.accessToken);
    saveRefreshToken(result.refreshToken);
    return result.accessToken;
  } catch {
    clearToken();
    return null;
  }
}

export async function getMe(): Promise<AuthUser | null> {
  // If stored user exists, return it; otherwise fallback to fetching if endpoint exists
  const cached = getStoredUser();
  if (cached) return cached;

  try {
    const response = await apiClient.get<ApiResponse<AuthUser>>("/auth/me");
    if (response.data.data) {
      saveUser(response.data.data);
      return response.data.data;
    }
  } catch {
    // If endpoint is not yet implemented or fails, return null
  }
  return null;
}
