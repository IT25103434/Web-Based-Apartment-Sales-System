package com.apartment.backend.listing;

import com.apartment.backend.common.FileStorageService;
import com.apartment.backend.common.exception.BadRequestException;
import com.apartment.backend.common.exception.ResourceNotFoundException;
import com.apartment.backend.common.exception.UnauthorizedException;
import com.apartment.backend.listing.dto.ListingRequest;
import com.apartment.backend.user.Role;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final ListingImageRepository listingImageRepository;
    private final FileStorageService fileStorageService;

    public List<Listing> search(String keyword, BigDecimal minPrice, BigDecimal maxPrice,
                                 Integer bedrooms, String city, String amenity, ListingStatus status) {
        Specification<Listing> spec = ListingSpecification.filter(keyword, minPrice, maxPrice, bedrooms, city, amenity, status);
        return listingRepository.findAll(spec);
    }

    public Listing getById(Long id) {
        return listingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));
    }

    public List<Listing> getMyListings(User agent) {
        return listingRepository.findByAgentOrderByCreatedAtDesc(agent);
    }

    public Listing create(User agent, ListingRequest request) {
        requireAgent(agent);

        Listing listing = Listing.builder()
                .agent(agent)
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())
                .sizeSqft(request.getSizeSqft())
                .address(request.getAddress())
                .city(request.getCity())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .amenities(request.getAmenities())
                .status(ListingStatus.AVAILABLE)
                .build();

        return listingRepository.save(listing);
    }

    public Listing update(Long id, User agent, ListingRequest request) {
        Listing listing = getById(id);
        requireOwnerOrAdmin(listing, agent);

        listing.setTitle(request.getTitle());
        listing.setDescription(request.getDescription());
        listing.setPrice(request.getPrice());
        listing.setBedrooms(request.getBedrooms());
        listing.setBathrooms(request.getBathrooms());
        listing.setSizeSqft(request.getSizeSqft());
        listing.setAddress(request.getAddress());
        listing.setCity(request.getCity());
        listing.setLatitude(request.getLatitude());
        listing.setLongitude(request.getLongitude());
        listing.setAmenities(request.getAmenities());

        return listingRepository.save(listing);
    }

    public Listing updateStatus(Long id, User agent, ListingStatus status) {
        Listing listing = getById(id);
        requireOwnerOrAdmin(listing, agent);
        listing.setStatus(status);
        return listingRepository.save(listing);
    }

    public void delete(Long id, User agent) {
        Listing listing = getById(id);
        requireOwnerOrAdmin(listing, agent);
        listingRepository.delete(listing);
    }

    public ListingImage addImage(Long listingId, User agent, MultipartFile file, boolean isPrimary) {
        Listing listing = getById(listingId);
        requireOwnerOrAdmin(listing, agent);

        String imageUrl = fileStorageService.storeImage(file);

        if (isPrimary) {
            // Only one image can be primary at a time.
            listing.getImages().forEach(img -> img.setPrimary(false));
        }

        ListingImage image = ListingImage.builder()
                .listing(listing)
                .imageUrl(imageUrl)
                .primary(isPrimary)
                .build();

        return listingImageRepository.save(image);
    }

    public void deleteImage(Long listingId, Long imageId, User agent) {
        Listing listing = getById(listingId);
        requireOwnerOrAdmin(listing, agent);

        ListingImage image = listingImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found"));

        if (!image.getListing().getId().equals(listing.getId())) {
            throw new BadRequestException("This image does not belong to this listing");
        }

        listingImageRepository.delete(image);
    }

    private void requireAgent(User user) {
        if (user.getRole() != Role.AGENT) {
            throw new UnauthorizedException("Only agents can manage listings");
        }
    }

    private void requireOwnerOrAdmin(Listing listing, User user) {
        boolean isOwner = listing.getAgent().getId().equals(user.getId());
        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You are not allowed to modify this listing");
        }
    }
}
