package com.apartment.backend.listing;

import com.apartment.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {
    List<Listing> findByAgentOrderByCreatedAtDesc(User agent);
    long countByStatus(ListingStatus status);
}
