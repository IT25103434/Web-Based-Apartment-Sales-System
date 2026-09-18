package com.apartment.backend.booking;

import com.apartment.backend.booking.dto.BookingRequest;
import com.apartment.backend.common.exception.BadRequestException;
import com.apartment.backend.common.exception.ResourceNotFoundException;
import com.apartment.backend.common.exception.UnauthorizedException;
import com.apartment.backend.listing.Listing;
import com.apartment.backend.listing.ListingService;
import com.apartment.backend.notification.EmailService;
import com.apartment.backend.notification.NotificationService;
import com.apartment.backend.notification.NotificationType;
import com.apartment.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    // Two appointments for the same agent must be at least this far apart,
    // so agents don't end up double-booked at the same time.
    private static final int SLOT_MINUTES = 60;

    private final BookingRepository bookingRepository;
    private final ListingService listingService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public List<Booking> getMyBookings(User user) {
        return switch (user.getRole()) {
            case AGENT -> bookingRepository.findByAgentOrderByScheduledAtDesc(user);
            default -> bookingRepository.findByBuyerOrderByScheduledAtDesc(user);
        };
    }

    /**
     * Returns the busy time-slots for an agent on a given day, so the frontend
     * calendar can grey out times that are already taken.
     */
    public List<Booking> getAgentBookingsForDay(Long agentId, LocalDateTime dayStart, LocalDateTime dayEnd) {
        User agent = User.builder().id(agentId).build();
        return bookingRepository.findConflicting(agent, dayStart, dayEnd);
    }

    public Booking create(User buyer, BookingRequest request) {
        Listing listing = listingService.getById(request.getListingId());
        User agent = listing.getAgent();

        LocalDateTime from = request.getScheduledAt().minusMinutes(SLOT_MINUTES - 1);
        LocalDateTime to = request.getScheduledAt().plusMinutes(SLOT_MINUTES - 1);

        List<Booking> conflicts = bookingRepository.findConflicting(agent, from, to);
        if (!conflicts.isEmpty()) {
            throw new BadRequestException("This agent already has a booking around that time. Please pick another slot.");
        }

        Booking booking = Booking.builder()
                .listing(listing)
                .buyer(buyer)
                .agent(agent)
                .scheduledAt(request.getScheduledAt())
                .notes(request.getNotes())
                .status(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);

        String formattedTime = booking.getScheduledAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));

        notificationService.notify(agent, "New site visit request",
                buyer.getFullName() + " requested a visit for \"" + listing.getTitle() + "\" on " + formattedTime,
                NotificationType.BOOKING);

        emailService.sendBookingConfirmationEmail(buyer.getEmail(), listing.getTitle(), formattedTime);

        return booking;
    }

    public Booking updateStatus(Long id, User agent, BookingStatus status) {
        Booking booking = getById(id);

        if (!booking.getAgent().getId().equals(agent.getId())) {
            throw new UnauthorizedException("This booking does not belong to you");
        }

        booking.setStatus(status);
        booking = bookingRepository.save(booking);

        String formattedTime = booking.getScheduledAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        notificationService.notify(booking.getBuyer(), "Booking " + status,
                "Your visit for \"" + booking.getListing().getTitle() + "\" on " + formattedTime + " is now " + status,
                NotificationType.BOOKING);
        emailService.sendBookingStatusEmail(booking.getBuyer().getEmail(), booking.getListing().getTitle(), status.name());

        return booking;
    }

    public void cancel(Long id, User buyer) {
        Booking booking = getById(id);

        if (!booking.getBuyer().getId().equals(buyer.getId())) {
            throw new UnauthorizedException("This booking does not belong to you");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);

        notificationService.notify(booking.getAgent(), "Booking cancelled",
                buyer.getFullName() + " cancelled their visit for \"" + booking.getListing().getTitle() + "\"",
                NotificationType.BOOKING);
    }

    public Booking getById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }
}
