package com.apartment.backend.review.dto;

import com.apartment.backend.review.ReviewStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReviewModerationRequest {

    @NotNull(message = "Status is required")
    private ReviewStatus status; // APPROVED or REJECTED
}
