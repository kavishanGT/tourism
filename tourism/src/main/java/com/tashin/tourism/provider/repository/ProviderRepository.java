package com.tashin.tourism.provider.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.tashin.tourism.provider.entity.Provider;

public interface ProviderRepository
                extends JpaRepository<Provider, UUID>,
                JpaSpecificationExecutor<Provider> {

        @Query("SELECT COUNT(p) FROM Provider p WHERE p.verificationStatus = :status")
        long countByVerificationStatus(@Param("status") String status);
}
