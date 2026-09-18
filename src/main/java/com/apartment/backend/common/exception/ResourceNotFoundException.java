package com.apartment.backend.common.exception;

/**
 * Thrown when something (a listing, a user, a booking...) can't be found by id.
 * Handled by GlobalExceptionHandler and turned into a 404 response.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
