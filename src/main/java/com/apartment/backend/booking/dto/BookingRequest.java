package com.apartment.backend.booking.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequest {

    @NotNull(message = "Listing id is required")
    private Long listingId;

    @NotNull(message = "Scheduled date/time is required")
    @Future(message = "Scheduled date/time must be in the future")
    private LocalDateTime scheduledAt;

    private String notes;
}
