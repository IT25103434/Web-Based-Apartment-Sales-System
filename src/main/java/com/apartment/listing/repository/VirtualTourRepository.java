package com.apartment.listing.repository;

import com.apartment.listing.entity.VirtualTour;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VirtualTourRepository extends JpaRepository<VirtualTour, Long> {
    Optional<VirtualTour> findByApartmentApartmentId(Long apartmentId);
}
