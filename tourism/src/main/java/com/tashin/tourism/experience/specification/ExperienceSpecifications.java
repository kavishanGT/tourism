package com.tashin.tourism.experience.specification;

import java.math.BigDecimal;

import org.springframework.data.jpa.domain.Specification;

import com.tashin.tourism.experience.entity.Experience;

public final class ExperienceSpecifications {

    private ExperienceSpecifications() {
    }

    public static Specification<Experience> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Experience> published() {
        return (root, query, cb) -> cb.equal(root.get("status"), "PUBLISHED");
    }

    public static Specification<Experience> destination(String slug) {
        return (root, query, cb) -> {
            if (slug == null || slug.isBlank())
                return cb.conjunction();
            return cb.equal(root.join("destination").get("slug"), slug);
        };
    }

    public static Specification<Experience> minPrice(BigDecimal min) {
        return (root, query, cb) -> {
            if (min == null)
                return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("priceFrom"), min);
        };
    }

    public static Specification<Experience> maxPrice(BigDecimal max) {
        return (root, query, cb) -> {
            if (max == null)
                return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("priceFrom"), max);
        };
    }

    public static Specification<Experience> minDuration(Integer min) {
        return (root, query, cb) -> {
            if (min == null)
                return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("durationMinutes"), min);
        };
    }

    public static Specification<Experience> maxDuration(Integer max) {
        return (root, query, cb) -> {
            if (max == null)
                return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("durationMinutes"), max);
        };
    }
}
