package com.tashin.tourism.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tashin.tourism.favorite.dto.CreateFavoriteRequest;
import com.tashin.tourism.trip.dto.CreateTripRequest;

public record ExecuteAgentActionRequest(
        @JsonProperty("action_type")
        String actionType,

        @JsonProperty("trip_proposal")
        CreateTripRequest tripProposal,

        @JsonProperty("favorite_proposal")
        CreateFavoriteRequest favoriteProposal
) {}
