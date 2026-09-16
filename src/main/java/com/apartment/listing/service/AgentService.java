package com.apartment.listing.service;

import com.apartment.listing.entity.Agent;
import com.apartment.listing.exception.ResourceNotFoundException;
import com.apartment.listing.repository.AgentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AgentService {

    private final AgentRepository agentRepository;

    @Value("${app.current.agent.email:john.alex@apexrealty.com}")
    private String currentAgentEmail;

    public AgentService(AgentRepository agentRepository) {
        this.agentRepository = agentRepository;
    }

    public List<Agent> getAllAgents() {
        return agentRepository.findAll();
    }

    public Agent getAgentById(Long agentId) {
        return agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Agent not found in database with ID: " + agentId));
    }

    public Agent getCurrentAgent() {
        return agentRepository.findByEmail(currentAgentEmail)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Configured development current agent email (" + currentAgentEmail + ") not found in ApartmentSalesDB.dbo.agents table."));
    }
}
