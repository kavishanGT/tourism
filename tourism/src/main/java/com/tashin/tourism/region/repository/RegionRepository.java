package com.tashin.tourism.region.repository;

import com.tashin.tourism.region.entity.Region;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface RegionRepository
        extends JpaRepository<Region, UUID> {

    Optional<Region> findBySlug(String slug);

    boolean existsBySlug(String slug);
}
