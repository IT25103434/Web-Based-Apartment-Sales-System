package com.apartment.backend.review;

import com.apartment.backend.listing.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByListingAndStatusOrderByCreatedAtDesc(Listing listing, ReviewStatus status);

    List<Review> findByStatusOrderByCreatedAtAsc(ReviewStatus status);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.listing = :listing AND r.status = com.apartment.backend.review.ReviewStatus.APPROVED")
    Double findAverageRatingForListing(@Param("listing") Listing listing);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.agent.id = :agentId AND r.status = com.apartment.backend.review.ReviewStatus.APPROVED")
    Double findAverageRatingForAgent(@Param("agentId") Long agentId);
}
