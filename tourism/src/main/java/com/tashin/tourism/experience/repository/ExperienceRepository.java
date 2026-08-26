package com.tashin.tourism.experience.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.tashin.tourism.experience.entity.Experience;

public interface ExperienceRepository
                extends JpaRepository<Experience, UUID>,
                JpaSpecificationExecutor<Experience> {

        Optional<Experience> findBySlugAndDeletedAtIsNull(String slug);

        long countByStatus(String status);
}
