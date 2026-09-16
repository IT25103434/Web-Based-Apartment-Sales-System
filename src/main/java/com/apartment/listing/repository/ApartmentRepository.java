package com.apartment.listing.repository;

import com.apartment.listing.entity.Apartment;
import com.apartment.listing.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {

    List<Apartment> findByAgentIdOrderByCreatedAtDesc(Long agentId);

    List<Apartment> findByAgentIdAndStatusOrderByCreatedAtDesc(Long agentId, ListingStatus status);

    @Query("SELECT a FROM Apartment a WHERE (:agentId IS NULL OR a.agentId = :agentId) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "AND (:query IS NULL OR :query = '' OR " +
           "     LOWER(a.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(a.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "     LOWER(a.city) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY a.createdAt DESC")
    List<Apartment> searchApartments(@Param("agentId") Long agentId,
                                    @Param("status") ListingStatus status,
                                    @Param("query") String query);

    @Query("SELECT COUNT(a) FROM Apartment a WHERE (:agentId IS NULL OR a.agentId = :agentId)")
    long countByAgentId(@Param("agentId") Long agentId);

    @Query("SELECT COUNT(a) FROM Apartment a WHERE (:agentId IS NULL OR a.agentId = :agentId) AND a.status = :status")
    long countByAgentIdAndStatus(@Param("agentId") Long agentId, @Param("status") ListingStatus status);
}
