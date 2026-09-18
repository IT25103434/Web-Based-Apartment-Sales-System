package com.apartment.backend.common.exception;

/**
 * Thrown for invalid input / broken business rules (e.g. double-booking,
 * email already registered). Handled by GlobalExceptionHandler -> 400 response.
 */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
