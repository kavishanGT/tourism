import axios from "axios";
import { env } from "@/config/env";

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15_000,
});

// Attach JWT access token to every request if present
apiClient.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("auth_token")
      : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh interceptor: on 401, silently refresh and retry once
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    // Skip refresh for the refresh endpoint itself or if already retried
    if (
      status === 401 &&
      !originalRequest._skipRefresh &&
      !originalRequest._retried &&
      typeof window !== "undefined"
    ) {
      originalRequest._retried = true;

      if (isRefreshing) {
        // Queue concurrent requests until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(apiClient(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;
      try {
        // Lazy import to avoid circular dependency
        const { refreshAccessToken } = await import("@/lib/auth/auth-client");
        const newToken = await refreshAccessToken();

        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } finally {
        isRefreshing = false;
      }
    }

    // Clear stale token on 403 (role mismatch, not expired)
    if (status === 403 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }

    return Promise.reject(error);
  }
);

