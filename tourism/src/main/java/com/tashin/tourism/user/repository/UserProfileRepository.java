package com.tashin.tourism.user.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tashin.tourism.user.entity.UserProfile;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
}
