package com.apartment.backend.search;

/**
 * The stages a buyer inquiry moves through, as described in the project
 * brief's CRM module: Inquiry -> Inspection -> Negotiation -> Closed.
 */
public enum LeadStage {
    INQUIRY,
    INSPECTION,
    NEGOTIATION,
    CLOSED
}
