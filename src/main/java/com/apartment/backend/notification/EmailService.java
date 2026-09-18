package com.apartment.backend.notification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends real emails via Spring's JavaMailSender (SMTP - see application.properties
 * for the mail server settings, e.g. Gmail SMTP + an app password).
 *
 * If sending fails (e.g. wrong SMTP credentials while developing), we just log
 * the error instead of crashing the whole request - a booking/registration
 * should still succeed even if the email happens to fail.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromAddress;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    public void sendEmail(String to, String subject, String body) {
        if (!mailEnabled) {
            log.info("Mail sending disabled. Would have sent to {}: {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {} - subject: {}", to, subject);
        } catch (Exception e) {
            // Don't let a broken mail server break the actual feature (registration,
            // booking, etc.) - just log it so it shows up in the console.
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public void sendWelcomeEmail(String to, String fullName) {
        String subject = "Welcome to Apartment Sales System!";
        String body = "Hi " + fullName + ",\n\n"
                + "Thanks for registering on the Apartment Sales System. "
                + "You can now browse listings, book site visits, and more.\n\n"
                + "Best regards,\nApartment Sales System Team";
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "Password Reset Request";
        String body = "Hello,\n\n"
                + "We received a request to reset your password. Click the link below to set a new one "
                + "(this link expires in 30 minutes):\n\n"
                + resetLink
                + "\n\nIf you did not request this, you can safely ignore this email.\n\n"
                + "Best regards,\nApartment Sales System Team";
        sendEmail(to, subject, body);
    }

    public void sendBookingConfirmationEmail(String to, String listingTitle, String scheduledTime) {
        String subject = "Site Visit Booking Confirmed";
        String body = "Hello,\n\n"
                + "Your site visit for \"" + listingTitle + "\" has been booked for " + scheduledTime + ".\n\n"
                + "We look forward to seeing you there!\n\n"
                + "Best regards,\nApartment Sales System Team";
        sendEmail(to, subject, body);
    }

    public void sendBookingStatusEmail(String to, String listingTitle, String status) {
        String subject = "Site Visit Booking Update";
        String body = "Hello,\n\n"
                + "Your site visit booking for \"" + listingTitle + "\" has been updated to: " + status + ".\n\n"
                + "Best regards,\nApartment Sales System Team";
        sendEmail(to, subject, body);
    }

    public void sendReviewModerationEmail(String to, String listingTitle, String status) {
        String subject = "Your Review Has Been " + status;
        String body = "Hello,\n\n"
                + "Your review for \"" + listingTitle + "\" has been " + status.toLowerCase() + " by our moderation team.\n\n"
                + "Best regards,\nApartment Sales System Team";
        sendEmail(to, subject, body);
    }

    public void sendTransactionReceiptEmail(String to, String listingTitle, String amount, String reference) {
        String subject = "Payment Receipt - " + reference;
        String body = "Hello,\n\n"
                + "We have received your reservation deposit of " + amount + " for \"" + listingTitle + "\".\n"
                + "Reference number: " + reference + "\n\n"
                + "(Note: this is a simulated/mock transaction for demo purposes - no real payment was processed.)\n\n"
                + "Best regards,\nApartment Sales System Team";
        sendEmail(to, subject, body);
    }
}
