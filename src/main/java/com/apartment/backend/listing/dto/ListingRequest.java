package com.apartment.backend.listing.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ListingRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Number of bedrooms is required")
    @Min(value = 0, message = "Bedrooms cannot be negative")
    private Integer bedrooms;

    @NotNull(message = "Number of bathrooms is required")
    @Min(value = 0, message = "Bathrooms cannot be negative")
    private Integer bathrooms;

    private Integer sizeSqft;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    private Double latitude;

    private Double longitude;

    private String amenities;
}
