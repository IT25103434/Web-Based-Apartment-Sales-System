package com.apartment.backend.search;

import com.apartment.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedSearchRepository extends JpaRepository<SavedSearch, Long> {
    List<SavedSearch> findByBuyerOrderByCreatedAtDesc(User buyer);
}
