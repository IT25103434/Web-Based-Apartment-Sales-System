package com.apartment.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalBuyers;
    private long totalAgents;
    private long totalListings;
    private long activeListings;
    private long totalBookings;
    private long pendingReviews;
    private BigDecimal totalDeposits;
}
