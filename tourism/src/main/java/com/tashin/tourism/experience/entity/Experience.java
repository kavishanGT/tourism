package com.tashin.tourism.experience.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.locationtech.jts.geom.Point;

import com.tashin.tourism.destination.entity.Destination;
import com.tashin.tourism.provider.entity.Provider;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "experiences")
@Getter
@Setter
@NoArgsConstructor
public class Experience {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id")
    private Provider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    private Destination destination;

    @Column(nullable = false, length = 250)
    private String name;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "min_guests", nullable = false)
    private int minGuests = 1;

    @Column(name = "max_guests")
    private Integer maxGuests;

    @Column(name = "price_from", precision = 12, scale = 2)
    private BigDecimal priceFrom;

    @Column(columnDefinition = "bpchar(3)")
    private String currency;

    @Column(columnDefinition = "geography(Point,4326)")
    private Point location;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false)
    private boolean featured;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "published_by")
    private UUID publishedBy;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
