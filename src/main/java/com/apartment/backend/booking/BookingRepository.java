package com.apartment.backend.booking;

import com.apartment.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByBuyerOrderByScheduledAtDesc(User buyer);

    List<Booking> findByAgentOrderByScheduledAtDesc(User agent);

    /**
     * Finds any active (not cancelled) booking for the same agent whose scheduled
     * time falls within [from, to] - used to detect double-bookings before
     * confirming a new appointment.
     */
    @Query("SELECT b FROM Booking b WHERE b.agent = :agent " +
           "AND b.status <> com.apartment.backend.booking.BookingStatus.CANCELLED " +
           "AND b.scheduledAt BETWEEN :from AND :to")
    List<Booking> findConflicting(@Param("agent") User agent,
                                   @Param("from") LocalDateTime from,
                                   @Param("to") LocalDateTime to);
}
