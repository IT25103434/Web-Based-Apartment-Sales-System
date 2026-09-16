package com.apartment.listing.dto;

import com.apartment.listing.entity.VirtualTour;
import com.apartment.listing.enums.TourType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class VirtualTourDto {

    private Long tourId;
    private Long apartmentId;

    @NotBlank(message = "Virtual tour URL cannot be empty")
    private String tourUrl;

    @NotNull(message = "Tour type is required")
    private TourType tourType = TourType.TOUR_360;

    private LocalDateTime createdAt;

    public VirtualTourDto() {}

    public static VirtualTourDto fromEntity(VirtualTour tour) {
        if (tour == null) return null;
        VirtualTourDto dto = new VirtualTourDto();
        dto.setTourId(tour.getTourId());
        if (tour.getApartment() != null) {
            dto.setApartmentId(tour.getApartment().getApartmentId());
        }
        dto.setTourUrl(tour.getTourUrl());
        dto.setTourType(tour.getTourType());
        dto.setCreatedAt(tour.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getTourId() {
        return tourId;
    }

    public void setTourId(Long tourId) {
        this.tourId = tourId;
    }

    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getTourUrl() {
        return tourUrl;
    }

    public void setTourUrl(String tourUrl) {
        this.tourUrl = tourUrl;
    }

    public TourType getTourType() {
        return tourType;
    }

    public void setTourType(TourType tourType) {
        this.tourType = tourType;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
