import { apiClient } from "./client";

export async function checkApiHealth(): Promise<{ status: string }> {
  const response = await apiClient.get("/health");
  return response.data?.data ?? { status: "UNKNOWN" };
}
