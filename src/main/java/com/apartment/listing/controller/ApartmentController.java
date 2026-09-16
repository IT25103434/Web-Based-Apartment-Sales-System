package com.apartment.listing.controller;

import com.apartment.listing.dto.*;
import com.apartment.listing.enums.ListingStatus;
import com.apartment.listing.service.ApartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apartments")
public class ApartmentController {

    private final ApartmentService apartmentService;

    public ApartmentController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDto> getDashboardStats() {
        DashboardStatsDto stats = apartmentService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping
    public ResponseEntity<List<ApartmentResponseDto>> getListings(
            @RequestParam(value = "status", required = false) ListingStatus status,
            @RequestParam(value = "query", required = false) String query) {
        List<ApartmentResponseDto> listings = apartmentService.getListings(status, query);
        return ResponseEntity.ok(listings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApartmentResponseDto> getApartmentById(@PathVariable("id") Long id) {
        ApartmentResponseDto apartment = apartmentService.getApartmentById(id);
        return ResponseEntity.ok(apartment);
    }

    @PostMapping
    public ResponseEntity<ApartmentResponseDto> createApartment(@Valid @RequestBody ApartmentRequestDto dto) {
        ApartmentResponseDto created = apartmentService.createApartment(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApartmentResponseDto> updateApartment(
            @PathVariable("id") Long id,
            @Valid @RequestBody ApartmentRequestDto dto) {
        ApartmentResponseDto updated = apartmentService.updateApartment(id, dto);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApartmentResponseDto> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody StatusUpdateRequestDto dto) {
        ApartmentResponseDto updated = apartmentService.updateStatus(id, dto.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApartment(@PathVariable("id") Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }
}
