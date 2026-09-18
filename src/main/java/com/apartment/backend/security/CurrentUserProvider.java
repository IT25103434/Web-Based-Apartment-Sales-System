package com.apartment.backend.security;

import com.apartment.backend.common.exception.UnauthorizedException;
import com.apartment.backend.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Small helper so controllers/services don't have to repeat the
 * SecurityContextHolder boilerplate every time they need "who is logged in".
 */
@Component
public class CurrentUserProvider {

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            throw new UnauthorizedException("You must be logged in to do this");
        }
        return (User) authentication.getPrincipal();
    }
}
