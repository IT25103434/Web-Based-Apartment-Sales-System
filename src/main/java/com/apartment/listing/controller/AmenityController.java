package com.apartment.listing.controller;

import com.apartment.listing.entity.Amenity;
import com.apartment.listing.repository.AmenityRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/amenities")
public class AmenityController {

    private final AmenityRepository amenityRepository;

    public AmenityController(AmenityRepository amenityRepository) {
        this.amenityRepository = amenityRepository;
    }

    @GetMapping
    public List<Amenity> getAllAmenities() {
        return amenityRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Amenity> createAmenity(@RequestBody Amenity amenity) {
        if (amenity.getName() == null || amenity.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Amenity saved = amenityRepository.save(amenity);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }
}
