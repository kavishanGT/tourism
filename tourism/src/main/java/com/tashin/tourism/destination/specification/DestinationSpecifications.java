package com.tashin.tourism.destination.specification;

import org.springframework.data.jpa.domain.Specification;

import com.tashin.tourism.destination.entity.Destination;

public final class DestinationSpecifications {

    private DestinationSpecifications() {
    }

    public static Specification<Destination> notDeleted() {
        return (root, query, cb) -> cb.isNull(root.get("deletedAt"));
    }

    public static Specification<Destination> published() {
        return (root, query, cb) -> cb.equal(root.get("status"), "PUBLISHED");
    }

    public static Specification<Destination> featured() {
        return (root, query, cb) -> cb.isTrue(root.get("featured"));
    }

    public static Specification<Destination> search(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("name")), pattern),
                    cb.like(cb.lower(root.get("shortDescription")), pattern));
        };
    }

    public static Specification<Destination> region(String regionSlug) {
        return (root, query, cb) -> {
            if (regionSlug == null || regionSlug.isBlank()) {
                return cb.conjunction();
            }
            return cb.equal(root.join("region").get("slug"), regionSlug);
        };
    }
}
