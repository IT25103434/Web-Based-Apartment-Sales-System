package com.apartment.backend.listing;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "listing_images")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ListingImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Column(nullable = false, length = 300)
    private String imageUrl;

    @Column(nullable = false, name = "is_primary")
    @Builder.Default
    private boolean primary = false;
}
