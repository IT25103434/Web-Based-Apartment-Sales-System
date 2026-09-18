package com.apartment.backend.review;

import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.review.dto.ReviewModerationRequest;
import com.apartment.backend.review.dto.ReviewRequest;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/api/listings/{listingId}/reviews")
    public ResponseEntity<ApiResponse<List<Review>>> getForListing(@PathVariable Long listingId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getApprovedReviewsForListing(listingId)));
    }

    @GetMapping("/api/listings/{listingId}/reviews/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(@PathVariable Long listingId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getListingRatingSummary(listingId)));
    }

    @PostMapping("/api/reviews")
    public ResponseEntity<ApiResponse<Review>> create(@Valid @RequestBody ReviewRequest request) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Review submitted for moderation", reviewService.create(buyer, request)));
    }

    @GetMapping("/api/reviews/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Review>>> getPending() {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getPendingReviews()));
    }

    @PutMapping("/api/reviews/{id}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Review>> moderate(@PathVariable Long id, @Valid @RequestBody ReviewModerationRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Review moderated", reviewService.moderate(id, request.getStatus())));
    }
}
