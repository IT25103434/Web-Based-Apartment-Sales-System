package com.apartment.listing.dto;

public class DashboardStatsDto {

    private long totalListings;
    private long draftListings;
    private long availableListings;
    private long reservedListings;
    private long soldListings;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalListings, long draftListings, long availableListings, long reservedListings, long soldListings) {
        this.totalListings = totalListings;
        this.draftListings = draftListings;
        this.availableListings = availableListings;
        this.reservedListings = reservedListings;
        this.soldListings = soldListings;
    }

    public long getTotalListings() {
        return totalListings;
    }

    public void setTotalListings(long totalListings) {
        this.totalListings = totalListings;
    }

    public long getDraftListings() {
        return draftListings;
    }

    public void setDraftListings(long draftListings) {
        this.draftListings = draftListings;
    }

    public long getAvailableListings() {
        return availableListings;
    }

    public void setAvailableListings(long availableListings) {
        this.availableListings = availableListings;
    }

    public long getReservedListings() {
        return reservedListings;
    }

    public void setReservedListings(long reservedListings) {
        this.reservedListings = reservedListings;
    }

    public long getSoldListings() {
        return soldListings;
    }

    public void setSoldListings(long soldListings) {
        this.soldListings = soldListings;
    }
}
