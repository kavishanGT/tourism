package com.tashin.tourism.admin.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tashin.tourism.admin.dto.DashboardResponse;
import com.tashin.tourism.attraction.repository.AttractionRepository;
import com.tashin.tourism.destination.repository.DestinationRepository;
import com.tashin.tourism.experience.repository.ExperienceRepository;
import com.tashin.tourism.provider.repository.ProviderRepository;
import com.tashin.tourism.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;
    private final AttractionRepository attractionRepository;
    private final ExperienceRepository experienceRepository;
    private final ProviderRepository providerRepository;

    public DashboardResponse getDashboard(Authentication auth) {

        long totalUsers = userRepository.count();

        // Destinations
        long totalDest = destinationRepository.count();
        long pubDest = destinationRepository.countByStatus("PUBLISHED");
        long draftDest = destinationRepository.countByStatus("DRAFT");
        long pendingDest = destinationRepository.countByStatus("PENDING_REVIEW");

        // Attractions
        long totalAttr = attractionRepository.count();
        long pubAttr = attractionRepository.countByStatus("PUBLISHED");
        long draftAttr = attractionRepository.countByStatus("DRAFT");
        long pendingAttr = attractionRepository.countByStatus("PENDING_REVIEW");

        // Experiences
        long totalExp = experienceRepository.count();
        long pubExp = experienceRepository.countByStatus("PUBLISHED");
        long draftExp = experienceRepository.countByStatus("DRAFT");
        long pendingExp = experienceRepository.countByStatus("PENDING_REVIEW");

        // Providers
        long totalProv = providerRepository.count();
        long pendingProv = providerRepository.countByVerificationStatus("PENDING");
        long approvedProv = providerRepository.countByVerificationStatus("APPROVED");
        long rejectedProv = providerRepository.countByVerificationStatus("REJECTED");

        return new DashboardResponse(
                new DashboardResponse.EntityStats(totalUsers),
                new DashboardResponse.ContentStats(totalDest, pubDest, draftDest, pendingDest),
                new DashboardResponse.ContentStats(totalAttr, pubAttr, draftAttr, pendingAttr),
                new DashboardResponse.ContentStats(totalExp, pubExp, draftExp, pendingExp),
                new DashboardResponse.ProviderStats(totalProv, pendingProv, approvedProv, rejectedProv),
                new DashboardResponse.ReviewStats(0L, 0L)
        );
    }
}
