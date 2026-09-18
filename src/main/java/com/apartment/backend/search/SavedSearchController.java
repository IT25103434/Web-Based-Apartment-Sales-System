package com.apartment.backend.search;

import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.search.dto.SavedSearchRequest;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-searches")
@RequiredArgsConstructor
public class SavedSearchController {

    private final SavedSearchService savedSearchService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SavedSearch>>> getMine() {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(savedSearchService.getMySavedSearches(buyer)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SavedSearch>> create(@Valid @RequestBody SavedSearchRequest request) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Search saved", savedSearchService.create(buyer, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SavedSearch>> update(@PathVariable Long id, @Valid @RequestBody SavedSearchRequest request) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Saved search updated", savedSearchService.update(id, buyer, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        User buyer = currentUserProvider.getCurrentUser();
        savedSearchService.delete(id, buyer);
        return ResponseEntity.ok(ApiResponse.success("Saved search deleted", null));
    }
}
