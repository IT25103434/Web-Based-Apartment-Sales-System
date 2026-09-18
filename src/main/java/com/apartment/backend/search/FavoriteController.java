package com.apartment.backend.search;

import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Favorite>>> getMyFavorites() {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(favoriteService.getMyFavorites(buyer)));
    }

    @PostMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Favorite>> add(@PathVariable Long listingId) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Added to favorites", favoriteService.addFavorite(buyer, listingId)));
    }

    @DeleteMapping("/{listingId}")
    public ResponseEntity<ApiResponse<Void>> remove(@PathVariable Long listingId) {
        User buyer = currentUserProvider.getCurrentUser();
        favoriteService.removeFavorite(buyer, listingId);
        return ResponseEntity.ok(ApiResponse.success("Removed from favorites", null));
    }
}
