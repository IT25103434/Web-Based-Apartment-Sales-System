package com.apartment.backend.transaction;

import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.transaction.dto.TransactionRequest;
import com.apartment.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/mine")
    public ResponseEntity<ApiResponse<List<Transaction>>> getMine() {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(transactionService.getMyTransactions(buyer)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Transaction>> create(@Valid @RequestBody TransactionRequest request) {
        User buyer = currentUserProvider.getCurrentUser();
        Transaction transaction = transactionService.createMockTransaction(buyer, request);
        return ResponseEntity.ok(ApiResponse.success("Deposit recorded (simulated payment)", transaction));
    }
}
