package com.apartment.backend.listing;

import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.listing.dto.ListingRequest;
import com.apartment.backend.listing.dto.ListingResponse;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;
    private final CurrentUserProvider currentUserProvider;

    // ---------- Public browsing / search (Advanced Query Engine) ----------

    @GetMapping
    public ResponseEntity<ApiResponse<List<ListingResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String amenity,
            @RequestParam(required = false) ListingStatus status
    ) {
        List<Listing> listings = listingService.search(keyword, minPrice, maxPrice, bedrooms, city, amenity, status);
        List<ListingResponse> response = listings.stream().map(ListingResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> getById(@PathVariable Long id) {
        Listing listing = listingService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(ListingResponse.fromEntity(listing)));
    }

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getMyListings() {
        User agent = currentUserProvider.getCurrentUser();
        List<ListingResponse> response = listingService.getMyListings(agent).stream()
                .map(ListingResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ---------- Agent-only management (CRUD) ----------

    @PostMapping
    public ResponseEntity<ApiResponse<ListingResponse>> create(@Valid @RequestBody ListingRequest request) {
        User agent = currentUserProvider.getCurrentUser();
        Listing created = listingService.create(agent, request);
        return ResponseEntity.ok(ApiResponse.success("Listing created", ListingResponse.fromEntity(created)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> update(@PathVariable Long id, @Valid @RequestBody ListingRequest request) {
        User agent = currentUserProvider.getCurrentUser();
        Listing updated = listingService.update(id, agent, request);
        return ResponseEntity.ok(ApiResponse.success("Listing updated", ListingResponse.fromEntity(updated)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ListingResponse>> updateStatus(@PathVariable Long id, @RequestParam ListingStatus status) {
        User agent = currentUserProvider.getCurrentUser();
        Listing updated = listingService.updateStatus(id, agent, status);
        return ResponseEntity.ok(ApiResponse.success("Listing status updated", ListingResponse.fromEntity(updated)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User agent = currentUserProvider.getCurrentUser();
        listingService.delete(id, agent);
        return ResponseEntity.ok(ApiResponse.success("Listing deleted", null));
    }

    // ---------- Listing images (media pipeline) ----------

    @PostMapping("/{id}/images")
    public ResponseEntity<ApiResponse<ListingImage>> addImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "false") boolean primary
    ) {
        User agent = currentUserProvider.getCurrentUser();
        ListingImage image = listingService.addImage(id, agent, file, primary);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded", image));
    }

    @DeleteMapping("/{id}/images/{imageId}")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@PathVariable Long id, @PathVariable Long imageId) {
        User agent = currentUserProvider.getCurrentUser();
        listingService.deleteImage(id, imageId, agent);
        return ResponseEntity.ok(ApiResponse.success("Image deleted", null));
    }
}
