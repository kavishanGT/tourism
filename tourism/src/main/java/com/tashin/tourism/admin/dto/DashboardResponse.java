package com.tashin.tourism.admin.dto;

public record DashboardResponse(
        EntityStats users,
        ContentStats destinations,
        ContentStats attractions,
        ContentStats experiences,
        ProviderStats providers,
        ReviewStats reviews
) {
    public record EntityStats(long total) {}

    public record ContentStats(long total, long published, long draft, long pendingReview) {}

    public record ProviderStats(long total, long pending, long approved, long rejected) {}

    public record ReviewStats(long total, long pending) {}
}
