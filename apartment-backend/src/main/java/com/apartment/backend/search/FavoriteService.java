package com.apartment.backend.search;

import com.apartment.backend.common.exception.BadRequestException;
import com.apartment.backend.listing.Listing;
import com.apartment.backend.listing.ListingService;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ListingService listingService;

    public List<Favorite> getMyFavorites(User buyer) {
        return favoriteRepository.findByBuyerOrderByCreatedAtDesc(buyer);
    }

    public Favorite addFavorite(User buyer, Long listingId) {
        Listing listing = listingService.getById(listingId);

        if (favoriteRepository.existsByBuyerAndListing(buyer, listing)) {
            throw new BadRequestException("This listing is already in your favorites");
        }

        Favorite favorite = Favorite.builder()
                .buyer(buyer)
                .listing(listing)
                .build();

        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(User buyer, Long listingId) {
        Listing listing = listingService.getById(listingId);
        Favorite favorite = favoriteRepository.findByBuyerAndListing(buyer, listing)
                .orElseThrow(() -> new BadRequestException("This listing is not in your favorites"));
        favoriteRepository.delete(favorite);
    }
}
