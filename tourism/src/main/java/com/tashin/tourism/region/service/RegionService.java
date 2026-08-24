package com.tashin.tourism.region.service;

import com.tashin.tourism.region.dto.RegionResponse;
import com.tashin.tourism.region.entity.Region;
import com.tashin.tourism.region.repository.RegionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RegionService {

    private final RegionRepository repository;

    public List<RegionResponse> getAll() {

        return repository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public RegionResponse getBySlug(String slug) {

        Region region = repository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException(
                        "Region not found: " + slug));

        return toResponse(region);
    }

    private RegionResponse toResponse(Region region) {

        return new RegionResponse(
                region.getId(),
                region.getName(),
                region.getSlug(),
                region.getDescription(),
                region.getParent() != null
                        ? region.getParent().getId()
                        : null);
    }
}
