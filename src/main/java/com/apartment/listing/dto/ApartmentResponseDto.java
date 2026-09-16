package com.apartment.listing.dto;

import com.apartment.listing.entity.Apartment;
import com.apartment.listing.enums.ListingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class ApartmentResponseDto {

    private Long apartmentId;
    private Long agentId;
    private String agentName;
    private String title;
    private String description;
    private BigDecimal price;
    private String location;
    private String address;
    private String city;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer beds;
    private Integer sizeSqft;
    private ListingStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String primaryImagePath;
    private String primaryThumbnailPath;

    private List<ImageResponseDto> images = new ArrayList<>();
    private FloorPlanResponseDto floorPlan;
    private VirtualTourDto virtualTour;
    private Set<String> amenities;

    public ApartmentResponseDto() {}

    public static ApartmentResponseDto fromEntity(Apartment apartment, String agentName) {
        ApartmentResponseDto dto = new ApartmentResponseDto();
        dto.setApartmentId(apartment.getApartmentId());
        dto.setAgentId(apartment.getAgentId());
        dto.setAgentName(agentName);
        dto.setTitle(apartment.getTitle());
        dto.setDescription(apartment.getDescription());
        dto.setPrice(apartment.getPrice());
        dto.setLocation(apartment.getLocation());
        dto.setAddress(apartment.getAddress());
        dto.setCity(apartment.getCity());
        dto.setBedrooms(apartment.getBedrooms());
        dto.setBathrooms(apartment.getBathrooms());
        dto.setBeds(apartment.getBeds());
        dto.setSizeSqft(apartment.getSizeSqft());
        dto.setStatus(apartment.getStatus());
        dto.setCreatedAt(apartment.getCreatedAt());
        dto.setUpdatedAt(apartment.getUpdatedAt());

        if (apartment.getImages() != null && !apartment.getImages().isEmpty()) {
            List<ImageResponseDto> imgDtos = apartment.getImages().stream()
                    .map(ImageResponseDto::fromEntity)
                    .collect(Collectors.toList());
            dto.setImages(imgDtos);

            // Find primary image or use first image
            ImageResponseDto primary = imgDtos.stream()
                    .filter(ImageResponseDto::getPrimaryImage)
                    .findFirst()
                    .orElse(imgDtos.get(0));

            dto.setPrimaryImagePath(primary.getImagePath());
            dto.setPrimaryThumbnailPath(primary.getThumbnailPath());
        }

        if (apartment.getFloorPlan() != null) {
            dto.setFloorPlan(FloorPlanResponseDto.fromEntity(apartment.getFloorPlan()));
        }

        if (apartment.getVirtualTour() != null) {
            dto.setVirtualTour(VirtualTourDto.fromEntity(apartment.getVirtualTour()));
        }

        if (apartment.getAmenities() != null) {
            dto.setAmenities(apartment.getAmenities().stream()
                    .map(a -> a.getName())
                    .collect(Collectors.toSet()));
        }

        return dto;
    }

    // Getters and Setters
    public Long getApartmentId() {
        return apartmentId;
    }

    public void setApartmentId(Long apartmentId) {
        this.apartmentId = apartmentId;
    }

    public Long getAgentId() {
        return agentId;
    }

    public void setAgentId(Long agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Integer getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Integer bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Integer getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Integer bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Integer getBeds() {
        return beds;
    }

    public void setBeds(Integer beds) {
        this.beds = beds;
    }

    public Integer getSizeSqft() {
        return sizeSqft;
    }

    public void setSizeSqft(Integer sizeSqft) {
        this.sizeSqft = sizeSqft;
    }

    public ListingStatus getStatus() {
        return status;
    }

    public void setStatus(ListingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getPrimaryImagePath() {
        return primaryImagePath;
    }

    public void setPrimaryImagePath(String primaryImagePath) {
        this.primaryImagePath = primaryImagePath;
    }

    public String getPrimaryThumbnailPath() {
        return primaryThumbnailPath;
    }

    public void setPrimaryThumbnailPath(String primaryThumbnailPath) {
        this.primaryThumbnailPath = primaryThumbnailPath;
    }

    public List<ImageResponseDto> getImages() {
        return images;
    }

    public void setImages(List<ImageResponseDto> images) {
        this.images = images;
    }

    public FloorPlanResponseDto getFloorPlan() {
        return floorPlan;
    }

    public void setFloorPlan(FloorPlanResponseDto floorPlan) {
        this.floorPlan = floorPlan;
    }

    public VirtualTourDto getVirtualTour() {
        return virtualTour;
    }

    public void setVirtualTour(VirtualTourDto virtualTour) {
        this.virtualTour = virtualTour;
    }

    public Set<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(Set<String> amenities) {
        this.amenities = amenities;
    }
}
