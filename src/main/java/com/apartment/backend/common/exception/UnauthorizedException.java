package com.apartment.backend.common.exception;

/**
 * Thrown when a logged-in user tries to do something they're not allowed to do
 * (e.g. edit someone else's listing). Handled by GlobalExceptionHandler -> 403.
 */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
