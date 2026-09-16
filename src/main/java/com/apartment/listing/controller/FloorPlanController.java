package com.apartment.listing.controller;

import com.apartment.listing.dto.FloorPlanResponseDto;
import com.apartment.listing.service.ApartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class FloorPlanController {

    private final ApartmentService apartmentService;

    public FloorPlanController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @PostMapping("/apartments/{id}/floor-plan")
    public ResponseEntity<FloorPlanResponseDto> uploadFloorPlan(
            @PathVariable("id") Long apartmentId,
            @RequestParam("file") MultipartFile file) {
        FloorPlanResponseDto dto = apartmentService.uploadFloorPlan(apartmentId, file);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @DeleteMapping("/floor-plans/{id}")
    public ResponseEntity<Void> deleteFloorPlan(@PathVariable("id") Long floorPlanId) {
        apartmentService.deleteFloorPlan(floorPlanId);
        return ResponseEntity.noContent().build();
    }
}
