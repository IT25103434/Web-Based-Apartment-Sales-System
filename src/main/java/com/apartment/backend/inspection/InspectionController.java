package com.apartment.backend.inspection;

import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.inspection.dto.InspectionRequest;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class InspectionController {

    private final InspectionService inspectionService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/api/listings/{listingId}/inspections")
    public ResponseEntity<ApiResponse<List<Inspection>>> getForListing(@PathVariable Long listingId) {
        return ResponseEntity.ok(ApiResponse.success(inspectionService.getForListing(listingId)));
    }

    @GetMapping("/api/inspections/{id}")
    public ResponseEntity<ApiResponse<Inspection>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(inspectionService.getById(id)));
    }

    @PostMapping("/api/inspections")
    public ResponseEntity<ApiResponse<Inspection>> create(@Valid @RequestBody InspectionRequest request) {
        User agent = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Inspection report created", inspectionService.create(agent, request)));
    }

    @PostMapping("/api/inspections/{id}/photos")
    public ResponseEntity<ApiResponse<InspectionPhoto>> addPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption
    ) {
        User agent = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Photo added", inspectionService.addPhoto(id, agent, file, caption)));
    }

    /**
     * Generates (or regenerates) the PDF and streams it directly back to the
     * browser as a download, as well as saving a copy under /uploads.
     */
    @GetMapping("/api/inspections/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        User agent = currentUserProvider.getCurrentUser();
        byte[] pdfBytes = inspectionService.generatePdf(id, agent);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inspection_report_" + id + ".pdf")
                .body(pdfBytes);
    }
}
