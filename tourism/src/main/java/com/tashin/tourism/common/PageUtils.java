package com.tashin.tourism.common;

import java.util.Arrays;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Reusable pagination and sort utilities shared across domain services.
 */
public final class PageUtils {

    private PageUtils() {
    }

    public static final int MAX_PAGE_SIZE = 100;

    /**
     * Build a safe Pageable, capping page size and whitelisting sort fields.
     */
    public static Pageable buildPageable(
            int page,
            int size,
            String[] sort,
            Set<String> allowedSorts,
            String defaultSort) {
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        int safePage = Math.max(page, 0);

        Sort sorting = Sort.by(
                Arrays.stream(sort)
                        .map(value -> {
                            String[] parts = value.split(",");
                            String field = parts[0].trim();
                            if (!allowedSorts.contains(field)) {
                                field = defaultSort;
                            }
                            Sort.Direction dir = (parts.length > 1
                                    && parts[1].trim().equalsIgnoreCase("desc"))
                                            ? Sort.Direction.DESC
                                            : Sort.Direction.ASC;
                            return new Sort.Order(dir, field);
                        })
                        .toList());

        return PageRequest.of(safePage, safeSize, sorting);
    }
}
