package com.apartment.backend.inspection;

import com.apartment.backend.common.FileStorageService;
import com.apartment.backend.common.exception.ResourceNotFoundException;
import com.apartment.backend.common.exception.UnauthorizedException;
import com.apartment.backend.inspection.dto.InspectionItemRequest;
import com.apartment.backend.inspection.dto.InspectionRequest;
import com.apartment.backend.listing.Listing;
import com.apartment.backend.listing.ListingService;
import com.apartment.backend.notification.NotificationService;
import com.apartment.backend.notification.NotificationType;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InspectionService {

    private final InspectionRepository inspectionRepository;
    private final InspectionPhotoRepository inspectionPhotoRepository;
    private final ListingService listingService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public List<Inspection> getForListing(Long listingId) {
        Listing listing = listingService.getById(listingId);
        return inspectionRepository.findByListingOrderByCreatedAtDesc(listing);
    }

    public Inspection getById(Long id) {
        return inspectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inspection not found"));
    }

    public Inspection create(User agent, InspectionRequest request) {
        Listing listing = listingService.getById(request.getListingId());

        List<InspectionItem> items = new ArrayList<>();
        int totalScore = 0;

        Inspection inspection = Inspection.builder()
                .listing(listing)
                .agent(agent)
                .generalNotes(request.getGeneralNotes())
                .items(items)
                .build();

        for (InspectionItemRequest itemRequest : request.getItems()) {
            InspectionItem item = InspectionItem.builder()
                    .inspection(inspection)
                    .category(itemRequest.getCategory())
                    .description(itemRequest.getDescription())
                    .conditionScore(itemRequest.getConditionScore())
                    .remarks(itemRequest.getRemarks())
                    .build();
            items.add(item);
            totalScore += itemRequest.getConditionScore();
        }

        int overallScore = request.getItems().isEmpty() ? 0 : Math.round((float) totalScore / request.getItems().size());
        inspection.setOverallScore(overallScore);

        inspection = inspectionRepository.save(inspection);

        notificationService.notify(listing.getAgent(), "Inspection report created",
                "A new inspection report was created for \"" + listing.getTitle() + "\"",
                NotificationType.INSPECTION);

        return inspection;
    }

    public InspectionPhoto addPhoto(Long inspectionId, User agent, MultipartFile file, String caption) {
        Inspection inspection = getById(inspectionId);
        requireOwner(inspection, agent);

        String photoUrl = fileStorageService.storeImage(file);

        InspectionPhoto photo = InspectionPhoto.builder()
                .inspection(inspection)
                .photoUrl(photoUrl)
                .caption(caption)
                .build();

        return inspectionPhotoRepository.save(photo);
    }

    /**
     * Generates the PDF report from the current inspection data, saves it to
     * disk, stores the file path on the inspection, and returns the raw bytes
     * so the controller can stream it straight back for download too.
     */
    public byte[] generatePdf(Long inspectionId, User agent) {
        Inspection inspection = getById(inspectionId);
        requireOwner(inspection, agent);

        byte[] pdfBytes = InspectionPdfGenerator.generate(inspection);

        String fileName = "inspection_" + inspection.getId() + "_" + System.currentTimeMillis() + ".pdf";
        String pdfUrl = fileStorageService.storeGeneratedFile(pdfBytes, fileName);

        inspection.setPdfUrl(pdfUrl);
        inspectionRepository.save(inspection);

        return pdfBytes;
    }

    private void requireOwner(Inspection inspection, User agent) {
        if (!inspection.getAgent().getId().equals(agent.getId())) {
            throw new UnauthorizedException("This inspection does not belong to you");
        }
    }
}
