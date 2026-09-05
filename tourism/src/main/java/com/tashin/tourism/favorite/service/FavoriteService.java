package com.tashin.tourism.favorite.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.accommodation.repository.AccommodationRepository;
import com.tashin.tourism.attraction.repository.AttractionRepository;
import com.tashin.tourism.destination.repository.DestinationRepository;
import com.tashin.tourism.experience.repository.ExperienceRepository;
import com.tashin.tourism.favorite.dto.CreateFavoriteRequest;
import com.tashin.tourism.favorite.dto.FavoriteDto;
import com.tashin.tourism.favorite.entity.Favorite;
import com.tashin.tourism.favorite.repository.FavoriteRepository;
import com.tashin.tourism.restaurant.repository.RestaurantRepository;
import com.tashin.tourism.user.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final DestinationRepository destinationRepository;
    private final AttractionRepository attractionRepository;
    private final ExperienceRepository experienceRepository;
    private final RestaurantRepository restaurantRepository;
    private final AccommodationRepository accommodationRepository;

    @Transactional
    public FavoriteDto addFavorite(User user, CreateFavoriteRequest request) {
        String type = request.entityType().toUpperCase();
        UUID entityId = request.entityId();

        // If entityId is null but entitySlug is provided, resolve the ID
        if (entityId == null && request.entitySlug() != null) {
            entityId = resolveIdBySlug(type, request.entitySlug());
        }

        if (entityId == null) {
            throw new IllegalArgumentException("Could not resolve entity ID for type " + type);
        }

        // Check if already favorited
        UUID finalEntityId = entityId;
        Favorite favorite = favoriteRepository.findByUserIdAndEntityTypeAndEntityId(user.getId(), type, finalEntityId)
                .orElseGet(() -> favoriteRepository.save(
                        Favorite.builder()
                                .user(user)
                                .entityType(type)
                                .entityId(finalEntityId)
                                .build()
                ));

        return mapToDto(favorite);
    }

    @Transactional(readOnly = true)
    public List<FavoriteDto> getUserFavorites(User user) {
        List<Favorite> favorites = favoriteRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<FavoriteDto> dtos = new ArrayList<>();
        for (Favorite fav : favorites) {
            FavoriteDto dto = mapToDto(fav);
            if (dto != null) {
                dtos.add(dto);
            }
        }
        return dtos;
    }

    @Transactional
    public void removeFavorite(User user, String entityType, UUID entityId) {
        favoriteRepository.deleteByUserIdAndEntityTypeAndEntityId(user.getId(), entityType.toUpperCase(), entityId);
    }

    private UUID resolveIdBySlug(String type, String slug) {
        return switch (type.toUpperCase()) {
            case "DESTINATION" -> destinationRepository.findBySlugAndDeletedAtIsNull(slug).map(d -> d.getId()).orElse(null);
            case "ATTRACTION" -> attractionRepository.findBySlugAndDeletedAtIsNull(slug).map(a -> a.getId()).orElse(null);
            case "EXPERIENCE" -> experienceRepository.findBySlugAndDeletedAtIsNull(slug).map(e -> e.getId()).orElse(null);
            case "RESTAURANT" -> restaurantRepository.findBySlug(slug).map(r -> r.getId()).orElse(null);
            case "ACCOMMODATION" -> accommodationRepository.findBySlug(slug).map(acc -> acc.getId()).orElse(null);
            default -> null;
        };
    }

    private FavoriteDto mapToDto(Favorite fav) {
        String type = fav.getEntityType().toUpperCase();
        UUID entityId = fav.getEntityId();

        try {
            return switch (type) {
                case "DESTINATION" -> destinationRepository.findById(entityId)
                        .map(d -> new FavoriteDto(
                                fav.getId(),
                                "DESTINATION",
                                d.getId(),
                                d.getName(),
                                d.getSlug(),
                                d.getRegion() != null ? d.getRegion().getName() : null,
                                "Destination",
                                fav.getCreatedAt()))
                        .orElseGet(() -> new FavoriteDto(fav.getId(), type, entityId, type, null, null, null, fav.getCreatedAt()));

                case "ATTRACTION" -> attractionRepository.findById(entityId)
                        .map(a -> new FavoriteDto(
                                fav.getId(),
                                "ATTRACTION",
                                a.getId(),
                                a.getName(),
                                a.getSlug(),
                                a.getDestination() != null && a.getDestination().getRegion() != null ? a.getDestination().getRegion().getName() : null,
                                "Attraction",
                                fav.getCreatedAt()))
                        .orElseGet(() -> new FavoriteDto(fav.getId(), type, entityId, type, null, null, null, fav.getCreatedAt()));

                case "EXPERIENCE" -> experienceRepository.findById(entityId)
                        .map(e -> new FavoriteDto(
                                fav.getId(),
                                "EXPERIENCE",
                                e.getId(),
                                e.getName(),
                                e.getSlug(),
                                e.getDestination() != null && e.getDestination().getRegion() != null ? e.getDestination().getRegion().getName() : null,
                                "Experience",
                                fav.getCreatedAt()))
                        .orElseGet(() -> new FavoriteDto(fav.getId(), type, entityId, type, null, null, null, fav.getCreatedAt()));

                case "RESTAURANT" -> restaurantRepository.findById(entityId)
                        .map(r -> new FavoriteDto(
                                fav.getId(),
                                "RESTAURANT",
                                r.getId(),
                                r.getName(),
                                r.getSlug(),
                                r.getDestination() != null && r.getDestination().getRegion() != null ? r.getDestination().getRegion().getName() : null,
                                "Dining",
                                fav.getCreatedAt()))
                        .orElseGet(() -> new FavoriteDto(fav.getId(), type, entityId, type, null, null, null, fav.getCreatedAt()));

                case "ACCOMMODATION" -> accommodationRepository.findById(entityId)
                        .map(acc -> new FavoriteDto(
                                fav.getId(),
                                "ACCOMMODATION",
                                acc.getId(),
                                acc.getName(),
                                acc.getSlug(),
                                acc.getDestination() != null && acc.getDestination().getRegion() != null ? acc.getDestination().getRegion().getName() : null,
                                "Accommodation",
                                fav.getCreatedAt()))
                        .orElseGet(() -> new FavoriteDto(fav.getId(), type, entityId, type, null, null, null, fav.getCreatedAt()));

                default -> new FavoriteDto(fav.getId(), type, entityId, type, null, null, null, fav.getCreatedAt());
            };
        } catch (Exception e) {
            log.warn("Error mapping favorite {}: {}", fav.getId(), e.getMessage());
            return new FavoriteDto(fav.getId(), type, entityId, type, null, null, null, fav.getCreatedAt());
        }
    }
}
