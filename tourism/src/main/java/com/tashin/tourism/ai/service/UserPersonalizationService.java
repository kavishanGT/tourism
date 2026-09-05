package com.tashin.tourism.ai.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.accommodation.repository.AccommodationRepository;
import com.tashin.tourism.ai.dto.UserPersonalizationDto;
import com.tashin.tourism.ai.dto.UserPersonalizationDto.UserFavoriteItemDto;
import com.tashin.tourism.ai.dto.UserPersonalizationDto.UserProfileContextDto;
import com.tashin.tourism.ai.dto.UserPersonalizationDto.UserSavedTripDto;
import com.tashin.tourism.ai.dto.UserPersonalizationDto.UserTripDayDto;
import com.tashin.tourism.ai.dto.UserPersonalizationDto.UserTripDayItemDto;
import com.tashin.tourism.attraction.repository.AttractionRepository;
import com.tashin.tourism.destination.repository.DestinationRepository;
import com.tashin.tourism.experience.repository.ExperienceRepository;
import com.tashin.tourism.favorite.entity.Favorite;
import com.tashin.tourism.favorite.repository.FavoriteRepository;
import com.tashin.tourism.restaurant.repository.RestaurantRepository;
import com.tashin.tourism.trip.entity.Trip;
import com.tashin.tourism.trip.repository.TripRepository;
import com.tashin.tourism.user.entity.User;
import com.tashin.tourism.user.entity.UserProfile;
import com.tashin.tourism.user.repository.UserProfileRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserPersonalizationService {

    private final UserProfileRepository userProfileRepository;
    private final FavoriteRepository favoriteRepository;
    private final TripRepository tripRepository;
    private final DestinationRepository destinationRepository;
    private final AttractionRepository attractionRepository;
    private final ExperienceRepository experienceRepository;
    private final RestaurantRepository restaurantRepository;
    private final AccommodationRepository accommodationRepository;

    @Transactional(readOnly = true)
    public UserPersonalizationDto buildPersonalizationContext(User user) {
        if (user == null || user.getId() == null) {
            return null;
        }

        UUID userId = user.getId();

        // 1. Build User Profile Context
        UserProfileContextDto profileDto = userProfileRepository.findById(userId)
                .map(this::mapProfile)
                .orElseGet(() -> new UserProfileContextDto(
                        userId.toString(),
                        user.getEmail(),
                        null,
                        null,
                        "en",
                        null,
                        Collections.emptyList(),
                        Collections.emptyList()));

        // 2. Build User Favorites
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<UserFavoriteItemDto> favoriteDtos = new ArrayList<>();

        for (Favorite fav : favorites) {
            UserFavoriteItemDto itemDto = resolveFavoriteItem(fav);
            if (itemDto != null) {
                favoriteDtos.add(itemDto);
            }
        }

        // 3. Build User Saved Trips
        List<Trip> trips;
        try {
            trips = tripRepository.findByUserIdWithDetails(userId);
        } catch (Exception e) {
            log.warn("Failed to fetch detailed trips, falling back to basic list: {}", e.getMessage());
            trips = tripRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        List<UserSavedTripDto> tripDtos = new ArrayList<>();
        for (Trip trip : trips) {
            tripDtos.add(mapTrip(trip));
        }

        return new UserPersonalizationDto(
                profileDto,
                favoriteDtos,
                tripDtos,
                tripDtos.isEmpty() ? null : tripDtos.get(0).tripId());
    }

    private UserProfileContextDto mapProfile(UserProfile profile) {
        return new UserProfileContextDto(
                profile.getUserId().toString(),
                profile.getDisplayName(),
                profile.getFirstName(),
                profile.getCountryCode(),
                profile.getPreferredLanguage() != null ? profile.getPreferredLanguage() : "en",
                profile.getBio(),
                Collections.emptyList(),
                Collections.emptyList());
    }

    private UserFavoriteItemDto resolveFavoriteItem(Favorite fav) {
        String type = fav.getEntityType().toUpperCase();
        UUID entityId = fav.getEntityId();

        try {
            switch (type) {
                case "DESTINATION" -> {
                    return destinationRepository.findById(entityId)
                            .map(d -> new UserFavoriteItemDto(
                                    "DESTINATION",
                                    d.getId().toString(),
                                    d.getName(),
                                    "Destination",
                                    d.getRegion() != null ? d.getRegion().getName() : null,
                                    d.getSlug()))
                            .orElse(null);
                }
                case "ATTRACTION" -> {
                    return attractionRepository.findById(entityId)
                            .map(a -> new UserFavoriteItemDto(
                                    "ATTRACTION",
                                    a.getId().toString(),
                                    a.getName(),
                                    "Attraction",
                                    a.getDestination() != null && a.getDestination().getRegion() != null
                                            ? a.getDestination().getRegion().getName()
                                            : null,
                                    a.getSlug()))
                            .orElse(null);
                }
                case "EXPERIENCE" -> {
                    return experienceRepository.findById(entityId)
                            .map(e -> new UserFavoriteItemDto(
                                    "EXPERIENCE",
                                    e.getId().toString(),
                                    e.getName(),
                                    "Experience",
                                    e.getDestination() != null && e.getDestination().getRegion() != null
                                            ? e.getDestination().getRegion().getName()
                                            : null,
                                    e.getSlug()))
                            .orElse(null);
                }
                case "RESTAURANT" -> {
                    return restaurantRepository.findById(entityId)
                            .map(r -> new UserFavoriteItemDto(
                                    "RESTAURANT",
                                    r.getId().toString(),
                                    r.getName(),
                                    "Dining",
                                    r.getDestination() != null && r.getDestination().getRegion() != null
                                            ? r.getDestination().getRegion().getName()
                                            : null,
                                    r.getSlug()))
                            .orElse(null);
                }
                case "ACCOMMODATION" -> {
                    return accommodationRepository.findById(entityId)
                            .map(acc -> new UserFavoriteItemDto(
                                    "ACCOMMODATION",
                                    acc.getId().toString(),
                                    acc.getName(),
                                    "Hotel & Stay",
                                    acc.getDestination() != null && acc.getDestination().getRegion() != null
                                            ? acc.getDestination().getRegion().getName()
                                            : null,
                                    acc.getSlug()))
                            .orElse(null);
                }
                default -> {
                    return new UserFavoriteItemDto(
                            type,
                            entityId.toString(),
                            type + " item",
                            null,
                            null,
                            null);
                }
            }
        } catch (Exception e) {
            log.warn("Error resolving favorite entity {}: {}", entityId, e.getMessage());
            return null;
        }
    }

    private UserSavedTripDto mapTrip(Trip trip) {
        List<UserTripDayDto> dayDtos = new ArrayList<>();

        if (trip.getDays() != null) {
            for (var day : trip.getDays()) {
                List<UserTripDayItemDto> itemDtos = new ArrayList<>();
                if (day.getItems() != null) {
                    for (var itm : day.getItems()) {
                        String entityTitle = null;
                        String entityType = null;

                        if (itm.getAttraction() != null) {
                            entityType = "ATTRACTION";
                            entityTitle = itm.getAttraction().getName();
                        } else if (itm.getExperience() != null) {
                            entityType = "EXPERIENCE";
                            entityTitle = itm.getExperience().getName();
                        } else if (itm.getRestaurant() != null) {
                            entityType = "RESTAURANT";
                            entityTitle = itm.getRestaurant().getName();
                        } else if (itm.getAccommodation() != null) {
                            entityType = "ACCOMMODATION";
                            entityTitle = itm.getAccommodation().getName();
                        }

                        itemDtos.add(new UserTripDayItemDto(
                                itm.getTitle(),
                                entityType,
                                entityTitle,
                                itm.getStartTime() != null ? itm.getStartTime().toString() : null,
                                itm.getEndTime() != null ? itm.getEndTime().toString() : null,
                                itm.getNotes()));
                    }
                }

                dayDtos.add(new UserTripDayDto(
                        day.getDayNumber(),
                        day.getDate() != null ? day.getDate().toString() : null,
                        day.getTitle(),
                        itemDtos));
            }
        }

        return new UserSavedTripDto(
                trip.getId().toString(),
                trip.getTitle(),
                trip.getDescription(),
                trip.getStartDate() != null ? trip.getStartDate().toString() : null,
                trip.getEndDate() != null ? trip.getEndDate().toString() : null,
                trip.getStatus(),
                dayDtos);
    }
}
