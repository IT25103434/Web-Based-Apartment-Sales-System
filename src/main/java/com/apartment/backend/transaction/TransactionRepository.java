package com.apartment.backend.transaction;

import com.apartment.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByBuyerOrderByCreatedAtDesc(User buyer);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = com.apartment.backend.transaction.TransactionStatus.SUCCESS")
    BigDecimal sumSuccessfulDeposits();
}
