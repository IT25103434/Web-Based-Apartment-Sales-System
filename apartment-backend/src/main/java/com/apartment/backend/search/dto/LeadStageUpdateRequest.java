package com.apartment.backend.search.dto;

import com.apartment.backend.search.LeadStage;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LeadStageUpdateRequest {

    @NotNull(message = "Stage is required")
    private LeadStage stage;

    // Optional note appended to the lead's communication history when the
    // stage changes (e.g. "Called buyer, scheduled inspection for Friday").
    private String note;
}
