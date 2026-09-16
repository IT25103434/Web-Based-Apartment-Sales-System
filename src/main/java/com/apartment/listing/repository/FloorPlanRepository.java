package com.apartment.listing.repository;

import com.apartment.listing.entity.FloorPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FloorPlanRepository extends JpaRepository<FloorPlan, Long> {
    Optional<FloorPlan> findByApartmentApartmentId(Long apartmentId);
}
