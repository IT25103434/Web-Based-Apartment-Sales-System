package com.apartment.backend.admin;

import com.apartment.backend.admin.dto.DashboardStatsResponse;
import com.apartment.backend.admin.dto.UpdateUserRoleRequest;
import com.apartment.backend.common.dto.ApiResponse;
import com.apartment.backend.security.CurrentUserProvider;
import com.apartment.backend.user.User;
import com.apartment.backend.user.dto.UserResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Every endpoint here requires the ADMIN role - this is the control center
 * for the platform (Module 2 in the project brief).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final CurrentUserProvider currentUserProvider;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = adminService.getAllUsers().stream()
                .map(UserResponse::fromEntity).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<UserResponse>> suspend(@PathVariable Long id) {
        User admin = currentUserProvider.getCurrentUser();
        User user = adminService.suspendUser(id, admin);
        return ResponseEntity.ok(ApiResponse.success("User suspended", UserResponse.fromEntity(user)));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<UserResponse>> activate(@PathVariable Long id) {
        User admin = currentUserProvider.getCurrentUser();
        User user = adminService.activateUser(id, admin);
        return ResponseEntity.ok(ApiResponse.success("User activated", UserResponse.fromEntity(user)));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateRole(@PathVariable Long id, @Valid @RequestBody UpdateUserRoleRequest request) {
        User admin = currentUserProvider.getCurrentUser();
        User user = adminService.updateUserRole(id, request.getRole(), admin);
        return ResponseEntity.ok(ApiResponse.success("User role updated", UserResponse.fromEntity(user)));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAuditLogs() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAuditLogs()));
    }
}
