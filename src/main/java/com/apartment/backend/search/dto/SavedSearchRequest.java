package com.apartment.backend.search.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class SavedSearchRequest {
    private String label;
    private String keyword;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer bedrooms;
    private String city;
    private String amenity;
}
