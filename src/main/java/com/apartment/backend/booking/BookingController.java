package com.apartment.backend.booking;

import com.apartment.backend.booking.dto.BookingRequest;
import com.apartment.backend.booking.dto.BookingStatusUpdateRequest;
import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Booking>>> getMyBookings() {
        User user = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMyBookings(user)));
    }

    /**
     * Availability check for a given agent + day, so the frontend calendar
     * can show which slots are already taken.
     */
    @GetMapping("/availability")
    public ResponseEntity<ApiResponse<List<Booking>>> getAvailability(
            @RequestParam Long agentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.atTime(23, 59, 59);
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAgentBookingsForDay(agentId, dayStart, dayEnd)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Booking>> create(@Valid @RequestBody BookingRequest request) {
        User buyer = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Booking requested", bookingService.create(buyer, request)));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Booking>> updateStatus(@PathVariable Long id, @Valid @RequestBody BookingStatusUpdateRequest request) {
        User agent = currentUserProvider.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Booking status updated", bookingService.updateStatus(id, agent, request.getStatus())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable Long id) {
        User buyer = currentUserProvider.getCurrentUser();
        bookingService.cancel(id, buyer);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled", null));
    }
}
