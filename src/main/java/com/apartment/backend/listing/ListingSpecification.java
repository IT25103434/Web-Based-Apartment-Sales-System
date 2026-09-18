package com.apartment.backend.listing;

import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

/**
 * Builds a dynamic JPA "WHERE" query for listing search based on whichever
 * filters the user actually provided. Any parameter left null is simply
 * skipped - this is what makes multi-criteria search work without writing
 * a separate method for every combination of filters.
 */
public class ListingSpecification {

    public static Specification<Listing> filter(String keyword,
                                                  BigDecimal minPrice,
                                                  BigDecimal maxPrice,
                                                  Integer bedrooms,
                                                  String city,
                                                  String amenity,
                                                  ListingStatus status) {

        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (keyword != null && !keyword.isBlank()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                predicates = cb.and(predicates, cb.or(
                        cb.like(cb.lower(root.get("title")), likePattern),
                        cb.like(cb.lower(root.get("description")), likePattern),
                        cb.like(cb.lower(root.get("address")), likePattern)
                ));
            }
            if (minPrice != null) {
                predicates = cb.and(predicates, cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            if (maxPrice != null) {
                predicates = cb.and(predicates, cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }
            if (bedrooms != null) {
                predicates = cb.and(predicates, cb.equal(root.get("bedrooms"), bedrooms));
            }
            if (city != null && !city.isBlank()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%"));
            }
            if (amenity != null && !amenity.isBlank()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("amenities")), "%" + amenity.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), status));
            }

            return predicates;
        };
    }
}
