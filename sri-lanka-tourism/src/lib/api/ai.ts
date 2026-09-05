import { apiClient } from "./client";

export interface Citation {
  citation_id: string;
  source_type?: "database" | "document" | "user_profile" | "user_favorite" | "user_trip";
  entity_type?: string;
  title?: string;
  slug?: string;
  category?: string;
  region?: string;
  document_id?: string;
  file_name?: string;
  page_number?: number;
  section?: string;
}

export interface CitationValidation {
  valid: boolean;
  found: string[];
  invalid: string[];
}

export interface RouteInfo {
  intent: string;
  confidence: number;
  reasoning: string;
  strategy: string;
}

export interface RetrievalMetadata {
  requested_mode: string;
  execution_mode: string;
  top_k: number;
  db_results_count: number;
  doc_results_count: number;
  has_user_context?: boolean;
  route?: RouteInfo;
}

export interface ProposedTripDayItem {
  title: string;
  entity_type?: string;
  entity_slug?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  estimated_cost?: number;
}

export interface ProposedTripDay {
  day_number: number;
  title: string;
  items: ProposedTripDayItem[];
}

export interface CreateTripPayload {
  title: string;
  description?: string;
  destination?: string;
  start_date?: string;
  end_date?: string;
  days: ProposedTripDay[];
}

export interface FavoritePayload {
  entity_type: string;
  entity_slug?: string;
  title: string;
}

export interface AgentActionPlan {
  has_action: boolean;
  action_type: "CREATE_TRIP" | "ADD_TRIP_ITEM" | "FAVORITE_ENTITY";
  summary?: string;
  trip_proposal?: CreateTripPayload;
  favorite_proposal?: FavoritePayload;
}

export interface AiChatRequest {
  query: string;
  retrievalMode?: "auto" | "hybrid_db" | "hybrid_rerank" | "dense";
  topK?: number;
}

export interface AiChatResponseData {
  query: string;
  answer: string;
  status: string;
  citations: Citation[];
  citation_validation?: CitationValidation;
  retrieval?: RetrievalMetadata;
  action_plan?: AgentActionPlan;
}

export async function askAiAssistant(
  request: AiChatRequest
): Promise<AiChatResponseData> {
  const response = await apiClient.post<{
    status: string;
    data: AiChatResponseData;
  }>("/ai/chat", request, {
    timeout: 120_000,
  });

  return response.data.data;
}

export async function executeAgentAction(payload: {
  action_type: string;
  trip_proposal?: CreateTripPayload;
  favorite_proposal?: FavoritePayload;
}): Promise<any> {
  const response = await apiClient.post<{
    status: string;
    data: any;
  }>("/ai/agent/execute-action", payload);

  return response.data.data;
}
