package com.tashin.tourism.destination.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.tashin.tourism.destination.entity.Destination;

public interface DestinationRepository
                extends JpaRepository<Destination, UUID>,
                JpaSpecificationExecutor<Destination> {

        Optional<Destination> findBySlugAndDeletedAtIsNull(String slug);

        boolean existsBySlugAndDeletedAtIsNull(String slug);
}
