package com.tashin.tourism.trip.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tashin.tourism.trip.entity.Trip;

public interface TripRepository extends JpaRepository<Trip, UUID> {

    @Query("SELECT DISTINCT t FROM Trip t LEFT JOIN FETCH t.days d LEFT JOIN FETCH d.items WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    List<Trip> findByUserIdWithDetails(@Param("userId") UUID userId);

    List<Trip> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
