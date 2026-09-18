package com.apartment.backend.admin;

import com.apartment.backend.admin.dto.DashboardStatsResponse;
import com.apartment.backend.booking.BookingRepository;
import com.apartment.backend.common.exception.ResourceNotFoundException;
import com.apartment.backend.listing.ListingRepository;
import com.apartment.backend.listing.ListingStatus;
import com.apartment.backend.notification.NotificationService;
import com.apartment.backend.notification.NotificationType;
import com.apartment.backend.review.ReviewRepository;
import com.apartment.backend.review.ReviewStatus;
import com.apartment.backend.transaction.TransactionRepository;
import com.apartment.backend.user.Role;
import com.apartment.backend.user.User;
import com.apartment.backend.user.UserRepository;
import com.apartment.backend.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

    public DashboardStatsResponse getDashboardStats() {
        return new DashboardStatsResponse(
                userRepository.count(),
                userRepository.countByRole(Role.BUYER),
                userRepository.countByRole(Role.AGENT),
                listingRepository.count(),
                listingRepository.countByStatus(ListingStatus.AVAILABLE),
                bookingRepository.count(),
                reviewRepository.findByStatusOrderByCreatedAtAsc(ReviewStatus.PENDING).size(),
                transactionRepository.sumSuccessfulDeposits()
        );
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User suspendUser(Long userId, User admin) {
        User user = getUser(userId);
        user.setStatus(UserStatus.SUSPENDED);
        user = userRepository.save(user);

        logAction(admin, "SUSPEND_USER", "Suspended account: " + user.getEmail());
        notificationService.notify(user, "Account suspended",
                "Your account has been suspended by an administrator. Contact support for details.",
                NotificationType.SYSTEM);

        return user;
    }

    public User activateUser(Long userId, User admin) {
        User user = getUser(userId);
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        logAction(admin, "ACTIVATE_USER", "Reactivated account: " + user.getEmail());
        notificationService.notify(user, "Account reactivated",
                "Your account has been reactivated. You can log in again.",
                NotificationType.SYSTEM);

        return user;
    }

    public User updateUserRole(Long userId, Role newRole, User admin) {
        User user = getUser(userId);
        Role oldRole = user.getRole();
        user.setRole(newRole);
        user = userRepository.save(user);

        logAction(admin, "CHANGE_ROLE", "Changed role of " + user.getEmail() + " from " + oldRole + " to " + newRole);

        return user;
    }

    public List<AuditLog> getAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void logAction(User admin, String action, String details) {
        AuditLog log = AuditLog.builder()
                .admin(admin)
                .action(action)
                .details(details)
                .build();
        auditLogRepository.save(log);
    }
}
