package com.apartment.backend.search;

import com.apartment.backend.common.exception.ResourceNotFoundException;
import com.apartment.backend.common.exception.UnauthorizedException;
import com.apartment.backend.search.dto.SavedSearchRequest;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedSearchService {

    private final SavedSearchRepository savedSearchRepository;

    public List<SavedSearch> getMySavedSearches(User buyer) {
        return savedSearchRepository.findByBuyerOrderByCreatedAtDesc(buyer);
    }

    public SavedSearch create(User buyer, SavedSearchRequest request) {
        SavedSearch savedSearch = SavedSearch.builder()
                .buyer(buyer)
                .label(request.getLabel())
                .keyword(request.getKeyword())
                .minPrice(request.getMinPrice())
                .maxPrice(request.getMaxPrice())
                .bedrooms(request.getBedrooms())
                .city(request.getCity())
                .amenity(request.getAmenity())
                .build();
        return savedSearchRepository.save(savedSearch);
    }

    public SavedSearch update(Long id, User buyer, SavedSearchRequest request) {
        SavedSearch savedSearch = getOwned(id, buyer);
        savedSearch.setLabel(request.getLabel());
        savedSearch.setKeyword(request.getKeyword());
        savedSearch.setMinPrice(request.getMinPrice());
        savedSearch.setMaxPrice(request.getMaxPrice());
        savedSearch.setBedrooms(request.getBedrooms());
        savedSearch.setCity(request.getCity());
        savedSearch.setAmenity(request.getAmenity());
        return savedSearchRepository.save(savedSearch);
    }

    public void delete(Long id, User buyer) {
        SavedSearch savedSearch = getOwned(id, buyer);
        savedSearchRepository.delete(savedSearch);
    }

    private SavedSearch getOwned(Long id, User buyer) {
        SavedSearch savedSearch = savedSearchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Saved search not found"));
        if (!savedSearch.getBuyer().getId().equals(buyer.getId())) {
            throw new UnauthorizedException("This saved search does not belong to you");
        }
        return savedSearch;
    }
}
