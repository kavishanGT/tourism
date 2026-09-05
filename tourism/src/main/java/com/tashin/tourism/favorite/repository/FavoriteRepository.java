package com.tashin.tourism.favorite.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tashin.tourism.favorite.entity.Favorite;

public interface FavoriteRepository extends JpaRepository<Favorite, UUID> {

    List<Favorite> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Favorite> findByUserIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);

    void deleteByUserIdAndEntityTypeAndEntityId(UUID userId, String entityType, UUID entityId);
}
