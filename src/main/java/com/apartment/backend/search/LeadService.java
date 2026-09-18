package com.apartment.backend.search;

import com.apartment.backend.common.exception.ResourceNotFoundException;
import com.apartment.backend.common.exception.UnauthorizedException;
import com.apartment.backend.listing.Listing;
import com.apartment.backend.listing.ListingService;
import com.apartment.backend.notification.NotificationService;
import com.apartment.backend.notification.NotificationType;
import com.apartment.backend.search.dto.LeadRequest;
import com.apartment.backend.search.dto.LeadStageUpdateRequest;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final ListingService listingService;
    private final NotificationService notificationService;

    public List<Lead> getLeadsForAgent(User agent) {
        return leadRepository.findByAgentOrderByUpdatedAtDesc(agent);
    }

    public List<Lead> getLeadsForBuyer(User buyer) {
        return leadRepository.findByBuyerOrderByUpdatedAtDesc(buyer);
    }

    public Lead getById(Long id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lead not found"));
    }

    public Lead create(User buyer, LeadRequest request) {
        Listing listing = listingService.getById(request.getListingId());

        Lead lead = Lead.builder()
                .buyer(buyer)
                .agent(listing.getAgent())
                .listing(listing)
                .message(request.getMessage())
                .stage(LeadStage.INQUIRY)
                .communicationLog(buyer.getFullName() + ": " + request.getMessage())
                .build();

        lead = leadRepository.save(lead);

        notificationService.notify(
                listing.getAgent(),
                "New buyer inquiry",
                buyer.getFullName() + " is interested in \"" + listing.getTitle() + "\"",
                NotificationType.LEAD
        );

        return lead;
    }

    public Lead updateStage(Long id, User agent, LeadStageUpdateRequest request) {
        Lead lead = getById(id);

        if (!lead.getAgent().getId().equals(agent.getId())) {
            throw new UnauthorizedException("This lead does not belong to you");
        }

        lead.setStage(request.getStage());

        if (request.getNote() != null && !request.getNote().isBlank()) {
            String existing = lead.getCommunicationLog() == null ? "" : lead.getCommunicationLog() + "\n";
            lead.setCommunicationLog(existing + "[" + LocalDateTime.now() + "] " + agent.getFullName() + ": " + request.getNote());
        }

        lead = leadRepository.save(lead);

        notificationService.notify(
                lead.getBuyer(),
                "Your inquiry has moved to " + lead.getStage(),
                "Your inquiry for \"" + lead.getListing().getTitle() + "\" is now: " + lead.getStage(),
                NotificationType.LEAD
        );

        return lead;
    }
}
