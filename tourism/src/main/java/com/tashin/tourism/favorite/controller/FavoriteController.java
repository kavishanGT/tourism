package com.tashin.tourism.favorite.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tashin.tourism.common.api.ApiResponse;
import com.tashin.tourism.favorite.dto.CreateFavoriteRequest;
import com.tashin.tourism.favorite.dto.FavoriteDto;
import com.tashin.tourism.favorite.service.FavoriteService;
import com.tashin.tourism.user.entity.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/favorites")
@RequiredArgsConstructor
@Tag(name = "User Favorites", description = "Endpoints for bookmarking destinations, attractions, and experiences")
public class FavoriteController {

    private final FavoriteService favoriteService;

    @PostMapping
    @Operation(summary = "Add Favorite", description = "Bookmarks a destination, attraction, or experience for the authenticated user")
    public ApiResponse<FavoriteDto> addFavorite(
            @Valid @RequestBody CreateFavoriteRequest request,
            @AuthenticationPrincipal User user) {
        FavoriteDto created = favoriteService.addFavorite(user, request);
        return ApiResponse.success(created);
    }

    @GetMapping
    @Operation(summary = "Get User Favorites", description = "Lists all favorited places and activities for the authenticated user")
    public ApiResponse<List<FavoriteDto>> getUserFavorites(@AuthenticationPrincipal User user) {
        List<FavoriteDto> favorites = favoriteService.getUserFavorites(user);
        return ApiResponse.success(favorites);
    }

    @DeleteMapping("/{entityType}/{entityId}")
    @Operation(summary = "Remove Favorite", description = "Removes an item from the user's favorites wishlist")
    public ApiResponse<String> removeFavorite(
            @PathVariable String entityType,
            @PathVariable UUID entityId,
            @AuthenticationPrincipal User user) {
        favoriteService.removeFavorite(user, entityType, entityId);
        return ApiResponse.success("Favorite removed successfully");
    }
}
