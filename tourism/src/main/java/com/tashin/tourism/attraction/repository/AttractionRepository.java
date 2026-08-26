package com.tashin.tourism.attraction.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tashin.tourism.attraction.entity.Attraction;

public interface AttractionRepository
                extends JpaRepository<Attraction, UUID>,
                JpaSpecificationExecutor<Attraction> {

        Optional<Attraction> findBySlugAndDeletedAtIsNull(String slug);

        long countByStatus(String status);

        /**
         * PostGIS spatial query — finds attractions within :radius meters of the
         * given point, ordered by distance ascending.
         *
         * ST_DWithin uses the GIST spatial index automatically.
         */
        @Query(value = """
                        SELECT
                            a.id,
                            a.name,
                            a.slug,
                            ST_Y(a.location::geometry) AS latitude,
                            ST_X(a.location::geometry) AS longitude,
                            ST_Distance(
                                a.location,
                                ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography
                            ) AS distance_meters
                        FROM attractions a
                        WHERE a.deleted_at IS NULL
                          AND a.status = 'PUBLISHED'
                          AND ST_DWithin(
                                a.location,
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
