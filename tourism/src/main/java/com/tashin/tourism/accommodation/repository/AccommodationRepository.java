package com.tashin.tourism.accommodation.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.tashin.tourism.accommodation.entity.Accommodation;

public interface AccommodationRepository
                extends JpaRepository<Accommodation, UUID>,
                JpaSpecificationExecutor<Accommodation> {

        Optional<Accommodation> findBySlug(String slug);
}
