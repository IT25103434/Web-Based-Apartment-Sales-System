package com.apartment.listing.controller;

import com.apartment.listing.dto.VirtualTourDto;
import com.apartment.listing.service.ApartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class VirtualTourController {

    private final ApartmentService apartmentService;

    public VirtualTourController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @PostMapping("/apartments/{id}/virtual-tour")
    public ResponseEntity<VirtualTourDto> addVirtualTour(
            @PathVariable("id") Long apartmentId,
            @Valid @RequestBody VirtualTourDto dto) {
        VirtualTourDto saved = apartmentService.addOrUpdateVirtualTour(apartmentId, dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/virtual-tours/{id}")
    public ResponseEntity<VirtualTourDto> updateVirtualTour(
            @PathVariable("id") Long tourId,
            @Valid @RequestBody VirtualTourDto dto) {
        VirtualTourDto updated = apartmentService.addOrUpdateVirtualTour(dto.getApartmentId(), dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/virtual-tours/{id}")
    public ResponseEntity<Void> deleteVirtualTour(@PathVariable("id") Long tourId) {
        apartmentService.deleteVirtualTour(tourId);
        return ResponseEntity.noContent().build();
    }
}
