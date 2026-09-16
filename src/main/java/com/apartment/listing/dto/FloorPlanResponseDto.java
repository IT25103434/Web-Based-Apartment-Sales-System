package com.apartment.listing.dto;

import com.apartment.listing.entity.FloorPlan;
import java.time.LocalDateTime;

public class FloorPlanResponseDto {

    private Long floorPlanId;
    private Long apartmentId;
    private String fileName;
    private String filePath;
    private LocalDateTime uploadedAt;

    public FloorPlanResponseDto() {}

    public static FloorPlanResponseDto fromEntity(FloorPlan floorPlan) {
        if (floorPlan == null) return null;
        FloorPlanResponseDto dto = new FloorPlanResponseDto();
        dto.setFloorPlanId(floorPlan.getFloorPlanId());
        if (floorPlan.getApartment() != null) {
            dto.setApartmentId(floorPlan.getApartment().getApartmentId());
        }
        dto.setFileName(floorPlan.getFileName());
        dto.setFilePath(floorPlan.getFilePath());
        dto.setUploadedAt(floorPlan.getUploadedAt());
        return dto;
    }

    // Getters and Setters
    public Long getFloorPlanId() {
        return floorPlanId;
    }

    public void setFloorPlanId(Long floorPlanId) {
        this.floorPlanId = floorPlanId;
    }

    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}
