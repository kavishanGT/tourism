package com.tashin.tourism.ai.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tashin.tourism.ai.dto.AiChatRequest;
import com.tashin.tourism.ai.dto.AiChatResponse;
import com.tashin.tourism.ai.dto.FastApiRagRequest;
import com.tashin.tourism.ai.dto.UserPersonalizationDto;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public AiService(@Value("${rag.service.url:http://localhost:8001}") String ragServiceUrl) {
        String url = ragServiceUrl.endsWith("/") ? ragServiceUrl.substring(0, ragServiceUrl.length() - 1)
                : ragServiceUrl;

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10000);
        factory.setReadTimeout(120000); // 120 seconds for deep RAG & LLM generation

        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        this.restClient = RestClient.builder()
                .baseUrl(url)
                .requestFactory(factory)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public AiChatResponse askAi(AiChatRequest request) {
        return askAi(request, null);
    }

    public AiChatResponse askAi(AiChatRequest request, UserPersonalizationDto userContext) {
        String mode = request.retrievalMode() != null && !request.retrievalMode().isBlank() ? request.retrievalMode()
                : "auto";
        int topK = request.topK() != null && request.topK() > 0 ? request.topK() : 5;

        log.debug("Sending query to RAG service: '{}' with mode: '{}', hasUserContext: {}",
                request.query(), mode, userContext != null);

        FastApiRagRequest ragRequest = new FastApiRagRequest(request.query(), mode, topK, userContext);

        try {
            String rawJson = restClient.post()
                    .uri("/api/v1/rag/ask")
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(ragRequest)
                    .retrieve()
                    .body(String.class);

            if (rawJson == null || rawJson.isBlank()) {
                throw new IllegalStateException("Empty response from RAG service");
            }

            return objectMapper.readValue(rawJson, AiChatResponse.class);
        } catch (Exception e) {
            log.error("Failed to communicate with RAG service: {}", e.getMessage(), e);
            return new AiChatResponse(
                    request.query(),
                    "The AI Assistant service is currently undergoing maintenance or unavailable. Please try again shortly.",
                    "service_unavailable",
                    Collections.emptyList(),
                    null,
                    null,
                    null);
        }
    }
}
