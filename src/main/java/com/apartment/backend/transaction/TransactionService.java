package com.apartment.backend.transaction;

import com.apartment.backend.listing.Listing;
import com.apartment.backend.listing.ListingService;
import com.apartment.backend.notification.EmailService;
import com.apartment.backend.notification.NotificationService;
import com.apartment.backend.notification.NotificationType;
import com.apartment.backend.transaction.dto.TransactionRequest;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ListingService listingService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public List<Transaction> getMyTransactions(User buyer) {
        return transactionRepository.findByBuyerOrderByCreatedAtDesc(buyer);
    }

    /**
     * Creates a MOCK transaction record - no real payment gateway is involved.
     * The deposit is instantly marked as SUCCESS with a generated reference
     * number, purely so the rest of the app has a realistic transaction
     * history to display/report on.
     */
    public Transaction createMockTransaction(User buyer, TransactionRequest request) {
        Listing listing = listingService.getById(request.getListingId());

        String reference = "TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        Transaction transaction = Transaction.builder()
                .listing(listing)
                .buyer(buyer)
                .amount(request.getAmount())
                .reference(reference)
                .status(TransactionStatus.SUCCESS)
                .build();

        transaction = transactionRepository.save(transaction);

        notificationService.notify(buyer, "Deposit received",
                "Your deposit of " + request.getAmount() + " for \"" + listing.getTitle() + "\" was recorded. Ref: " + reference,
                NotificationType.TRANSACTION);

        emailService.sendTransactionReceiptEmail(buyer.getEmail(), listing.getTitle(),
                request.getAmount().toString(), reference);

        return transaction;
    }
}
