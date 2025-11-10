package com.example.backend.dto;

import com.example.backend.model.User;

public class AuthResponse {
    private boolean success;
    private String message;
    private Long userId;
    private String email;
    private String name;
    private String imageUrl;
    private User.Role role;

    public AuthResponse() {}

    public AuthResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public AuthResponse(boolean success, String message, User user) {
        this.success = success;
        this.message = message;
        if (user != null) {
            this.userId = user.getId();
            this.email = user.getEmail();
            this.name = user.getName();
            this.imageUrl = user.getImageUrl();
            this.role = user.getRole();
        }
    }

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public User.Role getRole() {
        return role;
    }

    public void setRole(User.Role role) {
        this.role = role;
    }
} 