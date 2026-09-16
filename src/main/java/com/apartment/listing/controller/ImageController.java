package com.apartment.listing.controller;

import com.apartment.listing.dto.ImageOrderRequestDto;
import com.apartment.listing.dto.ImageResponseDto;
import com.apartment.listing.service.ApartmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ImageController {

    private final ApartmentService apartmentService;

    public ImageController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @PostMapping("/apartments/{id}/images")
    public ResponseEntity<ImageResponseDto> uploadImage(
            @PathVariable("id") Long apartmentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "primary", defaultValue = "false") Boolean isPrimary) {
        ImageResponseDto dto = apartmentService.uploadImage(apartmentId, file, isPrimary);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @DeleteMapping("/images/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable("imageId") Long imageId) {
        apartmentService.deleteImage(imageId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/images/{imageId}/primary")
    public ResponseEntity<Void> setPrimaryImage(@PathVariable("imageId") Long imageId) {
        apartmentService.setPrimaryImage(imageId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/apartments/{id}/images/order")
    public ResponseEntity<List<ImageResponseDto>> reorderImages(
            @PathVariable("id") Long apartmentId,
            @RequestBody ImageOrderRequestDto dto) {
        List<ImageResponseDto> updatedList = apartmentService.reorderImages(apartmentId, dto.getImageIdsInOrder());
        return ResponseEntity.ok(updatedList);
    }
}
