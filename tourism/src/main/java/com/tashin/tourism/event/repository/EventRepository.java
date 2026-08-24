package com.tashin.tourism.event.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.tashin.tourism.event.entity.Event;

public interface EventRepository
                extends JpaRepository<Event, UUID>,
                JpaSpecificationExecutor<Event> {

        Optional<Event> findBySlug(String slug);
}
