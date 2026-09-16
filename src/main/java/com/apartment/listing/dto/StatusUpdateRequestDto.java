package com.apartment.listing.dto;

import com.apartment.listing.enums.ListingStatus;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateRequestDto {

    @NotNull(message = "Listing status is required")
    private ListingStatus status;

    public StatusUpdateRequestDto() {}

    public StatusUpdateRequestDto(ListingStatus status) {
        this.status = status;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
    }
}
