package com.apartment.backend.search;

import com.apartment.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByAgentOrderByUpdatedAtDesc(User agent);
    List<Lead> findByBuyerOrderByUpdatedAtDesc(User buyer);
}
