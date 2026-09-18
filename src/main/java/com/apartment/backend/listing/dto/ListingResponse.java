package com.apartment.backend.listing.dto;

import com.apartment.backend.listing.Listing;
import com.apartment.backend.listing.ListingImage;
import com.apartment.backend.listing.ListingStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListingResponse {

    private Long id;
    private Long agentId;
    private String agentName;
    private String agentPhone;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer sizeSqft;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private String amenities;
    private ListingStatus status;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ListingResponse fromEntity(Listing listing) {
        List<String> urls = listing.getImages() == null ? List.of() :
                listing.getImages().stream().map(ListingImage::getImageUrl).collect(Collectors.toList());

        return new ListingResponse(
                listing.getId(),
                listing.getAgent().getId(),
                listing.getAgent().getFullName(),
                listing.getAgent().getPhone(),
                listing.getTitle(),
                listing.getDescription(),
                listing.getPrice(),
                listing.getBedrooms(),
                listing.getBathrooms(),
                listing.getSizeSqft(),
                listing.getAddress(),
                listing.getCity(),
                listing.getLatitude(),
                listing.getLongitude(),
                listing.getAmenities(),
                listing.getStatus(),
                urls,
                listing.getCreatedAt(),
                listing.getUpdatedAt()
        );
    }
}
