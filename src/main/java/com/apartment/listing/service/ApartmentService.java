package com.apartment.listing.service;

import com.apartment.listing.dto.*;
import com.apartment.listing.entity.*;
import com.apartment.listing.enums.ListingStatus;
import com.apartment.listing.exception.BadRequestException;
import com.apartment.listing.exception.ResourceNotFoundException;
import com.apartment.listing.exception.UnauthorizedException;
import com.apartment.listing.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final ApartmentImageRepository apartmentImageRepository;
    private final FloorPlanRepository floorPlanRepository;
    private final VirtualTourRepository virtualTourRepository;
    private final AmenityRepository amenityRepository;
    private final AgentService agentService;
    private final ImageProcessingService imageProcessingService;
    private final MediaStorageService mediaStorageService;

    public ApartmentService(ApartmentRepository apartmentRepository,
                            ApartmentImageRepository apartmentImageRepository,
                            FloorPlanRepository floorPlanRepository,
                            VirtualTourRepository virtualTourRepository,
                            AmenityRepository amenityRepository,
                            AgentService agentService,
                            ImageProcessingService imageProcessingService,
                            MediaStorageService mediaStorageService) {
        this.apartmentRepository = apartmentRepository;
        this.apartmentImageRepository = apartmentImageRepository;
        this.floorPlanRepository = floorPlanRepository;
        this.virtualTourRepository = virtualTourRepository;
        this.amenityRepository = amenityRepository;
        this.agentService = agentService;
        this.imageProcessingService = imageProcessingService;
        this.mediaStorageService = mediaStorageService;
    }

    public DashboardStatsDto getDashboardStats() {
        Long currentAgentId = agentService.getCurrentAgent().getAgentId();
        long total = apartmentRepository.countByAgentId(currentAgentId);
        long draft = apartmentRepository.countByAgentIdAndStatus(currentAgentId, ListingStatus.DRAFT);
        long available = apartmentRepository.countByAgentIdAndStatus(currentAgentId, ListingStatus.AVAILABLE);
        long reserved = apartmentRepository.countByAgentIdAndStatus(currentAgentId, ListingStatus.RESERVED);
        long sold = apartmentRepository.countByAgentIdAndStatus(currentAgentId, ListingStatus.SOLD);

        return new DashboardStatsDto(total, draft, available, reserved, sold);
    }

    public List<ApartmentResponseDto> getListings(ListingStatus status, String query) {
        Long currentAgentId = agentService.getCurrentAgent().getAgentId();
        List<Apartment> apartments = apartmentRepository.searchApartments(currentAgentId, status, query);
        String agentName = getAgentName(currentAgentId);
        return apartments.stream()
                .map(apt -> ApartmentResponseDto.fromEntity(apt, agentName))
                .collect(Collectors.toList());
    }

    public ApartmentResponseDto getApartmentById(Long id) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment listing not found with ID: " + id));
        String agentName = getAgentName(apartment.getAgentId());
        return ApartmentResponseDto.fromEntity(apartment, agentName);
    }

    @Transactional
    public ApartmentResponseDto createApartment(ApartmentRequestDto dto) {
        Agent currentAgent = agentService.getCurrentAgent();
        Long agentIdToUse = currentAgent.getAgentId();

        Apartment apartment = new Apartment();
        apartment.setAgentId(agentIdToUse);

        updateApartmentFieldsFromDto(apartment, dto);

        // Always default newly created listings to AVAILABLE unless specified otherwise
        ListingStatus targetStatus = dto.getStatus() != null ? dto.getStatus() : ListingStatus.AVAILABLE;
        if (targetStatus == ListingStatus.AVAILABLE) {
            validateRequiredFieldsForPublish(apartment);
        }
        apartment.setStatus(targetStatus);

        Apartment saved = apartmentRepository.save(apartment);
        return ApartmentResponseDto.fromEntity(saved, currentAgent.getName());
    }

    @Transactional
    public ApartmentResponseDto updateApartment(Long apartmentId, ApartmentRequestDto dto) {
        Apartment apartment = getApartmentAndCheckOwnership(apartmentId);

        updateApartmentFieldsFromDto(apartment, dto);

        if (dto.getStatus() == ListingStatus.AVAILABLE) {
            validateRequiredFieldsForPublish(apartment);
            apartment.setStatus(ListingStatus.AVAILABLE);
        } else if (dto.getStatus() != null) {
            apartment.setStatus(dto.getStatus());
        }

        Apartment updated = apartmentRepository.save(apartment);
        return ApartmentResponseDto.fromEntity(updated, getAgentName(apartment.getAgentId()));
    }

    @Transactional
    public ApartmentResponseDto updateStatus(Long apartmentId, ListingStatus newStatus) {
        Apartment apartment = getApartmentAndCheckOwnership(apartmentId);

        if (newStatus == ListingStatus.AVAILABLE) {
            validateRequiredFieldsForPublish(apartment);
        }

        apartment.setStatus(newStatus);
        Apartment updated = apartmentRepository.save(apartment);
        return ApartmentResponseDto.fromEntity(updated, getAgentName(apartment.getAgentId()));
    }

    @Transactional
    public void deleteApartment(Long apartmentId) {
        Apartment apartment = getApartmentAndCheckOwnership(apartmentId);

        for (ApartmentImage img : apartment.getImages()) {
            mediaStorageService.deleteFileByUrl(img.getImagePath());
            mediaStorageService.deleteFileByUrl(img.getThumbnailPath());
        }

        if (apartment.getFloorPlan() != null) {
            mediaStorageService.deleteFileByUrl(apartment.getFloorPlan().getFilePath());
        }

        apartmentRepository.delete(apartment);
    }

    // --- Image Management ---

    @Transactional
    public ImageResponseDto uploadImage(Long apartmentId, MultipartFile file, Boolean isPrimary) {
        Apartment apartment = getApartmentAndCheckOwnership(apartmentId);

        ImageProcessingService.ProcessedImageResult result = imageProcessingService.processAndSaveImage(file);

        int currentImageCount = apartment.getImages().size();
        boolean makePrimary = Boolean.TRUE.equals(isPrimary) || currentImageCount == 0;

        if (makePrimary) {
            apartmentImageRepository.resetPrimaryImageForApartment(apartmentId);
            apartment.getImages().forEach(img -> img.setPrimaryImage(false));
        }

        ApartmentImage image = new ApartmentImage(
                apartment,
                result.getImagePath(),
                result.getThumbnailPath(),
                currentImageCount + 1,
                makePrimary
        );

        apartment.addImage(image);
        ApartmentImage savedImage = apartmentImageRepository.save(image);
        return ImageResponseDto.fromEntity(savedImage);
    }

    @Transactional
    public void deleteImage(Long imageId) {
        ApartmentImage image = apartmentImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));

        Apartment apartment = getApartmentAndCheckOwnership(image.getApartment().getApartmentId());

        mediaStorageService.deleteFileByUrl(image.getImagePath());
        mediaStorageService.deleteFileByUrl(image.getThumbnailPath());

        boolean wasPrimary = Boolean.TRUE.equals(image.getPrimaryImage());
        apartment.removeImage(image);
        apartmentImageRepository.delete(image);

        if (wasPrimary && !apartment.getImages().isEmpty()) {
            ApartmentImage firstImg = apartment.getImages().get(0);
            firstImg.setPrimaryImage(true);
            apartmentImageRepository.save(firstImg);
        }
    }

    @Transactional
    public void setPrimaryImage(Long imageId) {
        ApartmentImage image = apartmentImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Image not found with ID: " + imageId));

        Apartment apartment = getApartmentAndCheckOwnership(image.getApartment().getApartmentId());

        apartmentImageRepository.resetPrimaryImageForApartment(apartment.getApartmentId());
        apartment.getImages().forEach(img -> img.setPrimaryImage(img.getImageId().equals(imageId)));
    }

    @Transactional
    public List<ImageResponseDto> reorderImages(Long apartmentId, List<Long> imageIdsInOrder) {
        Apartment apartment = getApartmentAndCheckOwnership(apartmentId);

        Map<Long, ApartmentImage> imageMap = apartment.getImages().stream()
                .collect(Collectors.toMap(ApartmentImage::getImageId, img -> img));

        for (int i = 0; i < imageIdsInOrder.size(); i++) {
            Long imgId = imageIdsInOrder.get(i);
            if (imageMap.containsKey(imgId)) {
                ApartmentImage img = imageMap.get(imgId);
                img.setDisplayOrder(i + 1);
                apartmentImageRepository.save(img);
            }
        }

        return apartmentImageRepository.findByApartmentApartmentIdOrderByDisplayOrderAscImageIdAsc(apartmentId)
                .stream()
                .map(ImageResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // --- Floor Plan ---

    @Transactional
    public FloorPlanResponseDto uploadFloorPlan(Long apartmentId, MultipartFile file) {
        Apartment apartment = getApartmentAndCheckOwnership(apartmentId);

        if (apartment.getFloorPlan() != null) {
            mediaStorageService.deleteFileByUrl(apartment.getFloorPlan().getFilePath());
            floorPlanRepository.delete(apartment.getFloorPlan());
        }

        String pdfPath = mediaStorageService.storeFloorPlanPdf(file);
        FloorPlan floorPlan = new FloorPlan(apartment, file.getOriginalFilename(), pdfPath);
        apartment.setFloorPlan(floorPlan);

        FloorPlan saved = floorPlanRepository.save(floorPlan);
        return FloorPlanResponseDto.fromEntity(saved);
    }

    @Transactional
    public void deleteFloorPlan(Long floorPlanId) {
        FloorPlan floorPlan = floorPlanRepository.findById(floorPlanId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor plan not found with ID: " + floorPlanId));

        getApartmentAndCheckOwnership(floorPlan.getApartment().getApartmentId());

        mediaStorageService.deleteFileByUrl(floorPlan.getFilePath());
        floorPlan.getApartment().setFloorPlan(null);
        floorPlanRepository.delete(floorPlan);
    }

    // --- Virtual Tour ---

    @Transactional
    public VirtualTourDto addOrUpdateVirtualTour(Long apartmentId, VirtualTourDto dto) {
        Apartment apartment = getApartmentAndCheckOwnership(apartmentId);

        if (dto.getTourUrl() == null || !dto.getTourUrl().toLowerCase().startsWith("http")) {
            throw new BadRequestException("Invalid Virtual Tour URL. Must start with http:// or https://");
        }

        VirtualTour tour = apartment.getVirtualTour();
        if (tour == null) {
            tour = new VirtualTour(apartment, dto.getTourUrl(), dto.getTourType());
        } else {
            tour.setTourUrl(dto.getTourUrl());
            if (dto.getTourType() != null) {
                tour.setTourType(dto.getTourType());
            }
        }

        apartment.setVirtualTour(tour);
        VirtualTour saved = virtualTourRepository.save(tour);
        return VirtualTourDto.fromEntity(saved);
    }

    @Transactional
    public void deleteVirtualTour(Long tourId) {
        VirtualTour tour = virtualTourRepository.findById(tourId)
                .orElseThrow(() -> new ResourceNotFoundException("Virtual tour not found with ID: " + tourId));

        getApartmentAndCheckOwnership(tour.getApartment().getApartmentId());

        tour.getApartment().setVirtualTour(null);
        virtualTourRepository.delete(tour);
    }

    // --- Helper Methods ---

    private Apartment getApartmentAndCheckOwnership(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment not found with ID: " + apartmentId));
        Long currentAgentId = agentService.getCurrentAgent().getAgentId();
        if (!apartment.getAgentId().equals(currentAgentId)) {
            throw new UnauthorizedException("Access Denied: You do not own this listing");
        }
        return apartment;
    }

    private void updateApartmentFieldsFromDto(Apartment apartment, ApartmentRequestDto dto) {
        apartment.setTitle(dto.getTitle());
        apartment.setDescription(dto.getDescription());
        apartment.setPrice(dto.getPrice());
        apartment.setLocation(dto.getLocation());
        apartment.setAddress(dto.getAddress());
        apartment.setCity(dto.getCity());
        apartment.setBedrooms(dto.getBedrooms());
        apartment.setBathrooms(dto.getBathrooms());
        apartment.setBeds(dto.getBeds());
        apartment.setSizeSqft(dto.getSizeSqft());

        if (dto.getAmenityIds() != null) {
            Set<Amenity> amenities = dto.getAmenityIds().stream()
                    .map(id -> amenityRepository.findById(id).orElse(null))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            apartment.setAmenities(amenities);
        }
    }

    private void validateRequiredFieldsForPublish(Apartment apartment) {
        List<String> missingFields = new ArrayList<>();
        if (apartment.getTitle() == null || apartment.getTitle().trim().isEmpty()) {
            missingFields.add("Title");
        }
        if (apartment.getPrice() == null || apartment.getPrice().doubleValue() <= 0) {
            missingFields.add("Valid Price");
        }
        if (apartment.getLocation() == null || apartment.getLocation().trim().isEmpty()) {
            missingFields.add("Location");
        }
        if (apartment.getSizeSqft() == null || apartment.getSizeSqft() <= 0) {
            missingFields.add("Size in SqFt");
        }

        if (!missingFields.isEmpty()) {
            throw new BadRequestException("Cannot publish incomplete listing. Missing required fields: " 
                + String.join(", ", missingFields));
        }
    }

    private String getAgentName(Long agentId) {
        try {
            return agentService.getAgentById(agentId).getName();
        } catch (Exception e) {
            return "Agent #" + agentId;
        }
    }
}
