package com.apartment.backend.review;

import com.apartment.backend.common.exception.BadRequestException;
import com.apartment.backend.common.exception.ResourceNotFoundException;
import com.apartment.backend.listing.Listing;
import com.apartment.backend.listing.ListingService;
import com.apartment.backend.notification.EmailService;
import com.apartment.backend.notification.NotificationService;
import com.apartment.backend.notification.NotificationType;
import com.apartment.backend.review.dto.ReviewRequest;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ListingService listingService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public List<Review> getApprovedReviewsForListing(Long listingId) {
        Listing listing = listingService.getById(listingId);
        return reviewRepository.findByListingAndStatusOrderByCreatedAtDesc(listing, ReviewStatus.APPROVED);
    }

    public Map<String, Object> getListingRatingSummary(Long listingId) {
        Listing listing = listingService.getById(listingId);
        Double avg = reviewRepository.findAverageRatingForListing(listing);
        List<Review> approved = reviewRepository.findByListingAndStatusOrderByCreatedAtDesc(listing, ReviewStatus.APPROVED);
        return Map.of(
                "averageRating", avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0,
                "totalReviews", approved.size()
        );
    }

    public List<Review> getPendingReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtAsc(ReviewStatus.PENDING);
    }

    public Review create(User buyer, ReviewRequest request) {
        Listing listing = listingService.getById(request.getListingId());

        Review review = Review.builder()
                .listing(listing)
                .agent(listing.getAgent())
                .buyer(buyer)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ReviewStatus.PENDING)
                .build();

        return reviewRepository.save(review);
    }

    public Review moderate(Long id, ReviewStatus status) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (status != ReviewStatus.APPROVED && status != ReviewStatus.REJECTED) {
            throw new BadRequestException("Status must be APPROVED or REJECTED");
        }

        review.setStatus(status);
        review = reviewRepository.save(review);

        notificationService.notify(review.getBuyer(), "Review " + status.name().toLowerCase(),
                "Your review for \"" + review.getListing().getTitle() + "\" was " + status.name().toLowerCase(),
                NotificationType.REVIEW);
        emailService.sendReviewModerationEmail(review.getBuyer().getEmail(), review.getListing().getTitle(), status.name());

        return review;
    }
}
