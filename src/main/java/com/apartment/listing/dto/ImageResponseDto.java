package com.apartment.listing.dto;

import com.apartment.listing.entity.ApartmentImage;
import java.time.LocalDateTime;

public class ImageResponseDto {

    private Long imageId;
    private Long apartmentId;
    private String imagePath;
    private String thumbnailPath;
    private Integer displayOrder;
    private Boolean primaryImage;
    private LocalDateTime createdAt;

    public ImageResponseDto() {}

    public static ImageResponseDto fromEntity(ApartmentImage image) {
        ImageResponseDto dto = new ImageResponseDto();
        dto.setImageId(image.getImageId());
        if (image.getApartment() != null) {
            dto.setApartmentId(image.getApartment().getApartmentId());
        }
        dto.setImagePath(image.getImagePath());
        dto.setThumbnailPath(image.getThumbnailPath());
        dto.setDisplayOrder(image.getDisplayOrder());
        dto.setPrimaryImage(image.getPrimaryImage());
        dto.setCreatedAt(image.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getImageId() {
        return imageId;
    }

    public void setImageId(Long imageId) {
        this.imageId = imageId;
    }

    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getThumbnailPath() {
        return thumbnailPath;
    }

    public void setThumbnailPath(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getPrimaryImage() {
        return primaryImage;
    }

    public void setPrimaryImage(Boolean primaryImage) {
        this.primaryImage = primaryImage;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
