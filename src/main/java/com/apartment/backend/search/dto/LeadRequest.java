package com.apartment.backend.search.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeadRequest {

    @NotNull(message = "Listing id is required")
    private Long listingId;

    private String message;
}
