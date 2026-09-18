package com.apartment.backend.inspection;

import com.apartment.backend.listing.Listing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InspectionRepository extends JpaRepository<Inspection, Long> {
    List<Inspection> findByListingOrderByCreatedAtDesc(Listing listing);
}
