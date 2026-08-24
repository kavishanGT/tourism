package com.tashin.tourism.restaurant.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tashin.tourism.restaurant.entity.Restaurant;

import java.util.List;

public interface RestaurantRepository
                extends JpaRepository<Restaurant, UUID>,
                JpaSpecificationExecutor<Restaurant> {

        Optional<Restaurant> findBySlug(String slug);

        /** PostGIS nearby search for restaurants */
        @Query(value = """
                        SELECT
                            r.id, r.name, r.slug,
                            ST_Y(r.location::geometry) AS latitude,
                            ST_X(r.location::geometry) AS longitude,
                            ST_Distance(
                                r.location,
                                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
                            ) AS distance_meters
                        FROM restaurants r
                        WHERE r.status = 'PUBLISHED'
                          AND r.location IS NOT NULL
                          AND ST_DWithin(
                                r.location,
                                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                                :radius
                          )
                        ORDER BY distance_meters
                        LIMIT :limit
                        """, nativeQuery = true)
        List<Object[]> findNearby(
                        @Param("latitude") double latitude,
                        @Param("longitude") double longitude,
                        @Param("radius") double radius,
                        @Param("limit") int limit);
}
