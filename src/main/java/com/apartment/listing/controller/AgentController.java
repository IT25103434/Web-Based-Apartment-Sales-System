package com.apartment.listing.controller;

import com.apartment.listing.entity.Agent;
import com.apartment.listing.service.AgentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private final AgentService agentService;

    public AgentController(AgentService agentService) {
        this.agentService = agentService;
    }

    @GetMapping
    public List<Agent> getAllAgents() {
        return agentService.getAllAgents();
    }

    @GetMapping("/current")
    public Agent getCurrentAgent() {
        return agentService.getCurrentAgent();
    }
}
