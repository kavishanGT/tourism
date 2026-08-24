package com.tashin.tourism.common.api;

import org.springframework.data.domain.Page;

public final class PageMapper {

    private PageMapper() {
    }

    public static MetaResponse meta(Page<?> page) {
        return new MetaResponse(
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }
}
