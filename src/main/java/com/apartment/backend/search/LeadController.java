package com.apartment.backend.search;

import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.search.dto.LeadRequest;
import com.apartment.backend.search.dto.LeadStageUpdateRequest;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.Role;
import com.apartment.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;
    private final CurrentUserProvider currentUserProvider;

    /**
     * Returns the agent's lead pipeline, or the buyer's own inquiries,
     * depending on who is logged in.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Lead>>> getMyLeads() {
        User user = currentUserProvider.getCurrentUser();
        List<Lead> leads = user.getRole() == Role.AGENT
                ? leadService.getLeadsForAgent(user)
                : leadService.getLeadsForBuyer(user);
        return ResponseEntity.ok(ApiResponse.success(leads));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Lead>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(leadService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Lead>> create(@Valid @RequestBody LeadRequest request) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Inquiry sent to agent", leadService.create(buyer, request)));
    }

    @PutMapping("/{id}/stage")
    public ResponseEntity<ApiResponse<Lead>> updateStage(@PathVariable Long id, @Valid @RequestBody LeadStageUpdateRequest request) {
        User agent = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Lead stage updated", leadService.updateStage(id, agent, request)));
    }
}
