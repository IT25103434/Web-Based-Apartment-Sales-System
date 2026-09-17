package com.apartment.backend.search;

import com.apartment.backend.listing.Listing;
import com.apartment.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByBuyerOrderByCreatedAtDesc(User buyer);
    Optional<Favorite> findByBuyerAndListing(User buyer, Listing listing);
    boolean existsByBuyerAndListing(User buyer, Listing listing);
}
