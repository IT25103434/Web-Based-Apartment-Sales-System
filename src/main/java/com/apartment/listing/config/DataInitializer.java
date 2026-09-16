package com.apartment.listing.config;

import com.apartment.listing.entity.*;
import com.apartment.listing.enums.ListingStatus;
import com.apartment.listing.enums.TourType;
import com.apartment.listing.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AgentRepository agentRepository;
    private final AmenityRepository amenityRepository;
    private final ApartmentRepository apartmentRepository;

    public DataInitializer(AgentRepository agentRepository,
                           AmenityRepository amenityRepository,
                           ApartmentRepository apartmentRepository) {
        this.agentRepository = agentRepository;
        this.amenityRepository = amenityRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure default amenities exist if table is empty
        List<String> defaultAmenities = Arrays.asList(
                "Parking", "Swimming Pool", "Gym", "Security", "Elevator",
                "Garden", "Balcony", "Air Conditioning", "Internet", "CCTV"
        );

        for (String name : defaultAmenities) {
            amenityRepository.findByNameIgnoreCase(name)
                    .orElseGet(() -> amenityRepository.save(new Amenity(name)));
        }
        // Do NOT create, seed, or modify any agents or apartments.
        // Source of truth for agents is existing dbo.agents table in SQL Server.
    }
}
