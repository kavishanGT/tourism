package com.tashin.tourism.attraction.specification;

import java.math.BigDecimal;

import org.springframework.data.jpa.domain.Specification;

import com.tashin.tourism.attraction.entity.Attraction;

public final class AttractionSpecifications {

    private AttractionSpecifications() {
    }

    public static Specification<Attraction> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Attraction> published() {
        return (root, query, cb) -> cb.equal(root.get("status"), "PUBLISHED");
    }

    public static Specification<Attraction> featured() {
        return (root, query, cb) -> cb.isTrue(root.get("featured"));
    }

    public static Specification<Attraction> search(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank())
                return cb.conjunction();
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("shortDescription")), pattern));
        };
    }

    public static Specification<Attraction> destination(String destinationSlug) {
        return (root, query, cb) -> {
            if (destinationSlug == null || destinationSlug.isBlank())
                return cb.conjunction();
            return cb.equal(root.join("destination").get("slug"), destinationSlug);
        };
    }

    public static Specification<Attraction> minPrice(BigDecimal min) {
        return (root, query, cb) -> {
            if (min == null)
                return cb.conjunction();
            return cb.greaterThanOrEqualTo(root.get("priceFrom"), min);
        };
    }

    public static Specification<Attraction> maxPrice(BigDecimal max) {
        return (root, query, cb) -> {
            if (max == null)
                return cb.conjunction();
            return cb.lessThanOrEqualTo(root.get("priceFrom"), max);
        };
    }
}
