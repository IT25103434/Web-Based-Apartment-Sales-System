package com.apartment.backend.inspection.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class InspectionRequest {

    @NotNull(message = "Listing id is required")
    private Long listingId;

    private String generalNotes;

    @NotEmpty(message = "At least one checklist item is required")
    @Valid
    private List<InspectionItemRequest> items;
}
