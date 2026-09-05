package com.tashin.tourism.trip.controller;

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
import com.tashin.tourism.trip.dto.AddTripItemRequest;
import com.tashin.tourism.trip.dto.CreateTripRequest;
import com.tashin.tourism.trip.dto.TripDto;
import com.tashin.tourism.trip.service.TripService;
import com.tashin.tourism.user.entity.User;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/trips")
@RequiredArgsConstructor
@Tag(name = "Trips & Itineraries", description = "Endpoints for managing user trips and AI-generated itineraries")
public class TripController {

    private final TripService tripService;

    @PostMapping
    @Operation(summary = "Create a Trip", description = "Creates a new trip with days and itinerary items")
    public ApiResponse<TripDto> createTrip(
            @Valid @RequestBody CreateTripRequest request,
            @AuthenticationPrincipal User user) {
        TripDto created = tripService.createTrip(user, request);
        return ApiResponse.success(created);
    }

    @GetMapping
    @Operation(summary = "Get User Trips", description = "Retrieves all trips saved by the authenticated user")
    public ApiResponse<List<TripDto>> getUserTrips(@AuthenticationPrincipal User user) {
        List<TripDto> trips = tripService.getUserTrips(user);
        return ApiResponse.success(trips);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Trip Details", description = "Retrieves a specific trip with all its days and items")
    public ApiResponse<TripDto> getTripById(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        TripDto trip = tripService.getTripById(id, user);
        return ApiResponse.success(trip);
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Add Item to Trip", description = "Appends an activity or stop to a specific day of a trip")
    public ApiResponse<TripDto> addTripItem(
            @PathVariable UUID id,
            @Valid @RequestBody AddTripItemRequest request,
            @AuthenticationPrincipal User user) {
        TripDto updated = tripService.addTripItem(id, user, request);
        return ApiResponse.success(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete Trip", description = "Removes a trip and all associated itinerary days")
    public ApiResponse<String> deleteTrip(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        tripService.deleteTrip(id, user);
        return ApiResponse.success("Trip deleted successfully");
    }
}
