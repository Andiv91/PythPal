package com.example.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth-status")
public class AuthStatusController {
    
    @GetMapping
    public Map<String, Object> getAuthStatus() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> status = new HashMap<>();
        
        boolean isAuthenticated = auth != null && auth.isAuthenticated() && 
                !auth.getPrincipal().equals("anonymousUser");
        
        status.put("isAuthenticated", isAuthenticated);
        status.put("authorities", auth != null ? auth.getAuthorities() : null);
        status.put("principal", auth != null ? auth.getPrincipal() : null);
        status.put("details", auth != null ? auth.getDetails() : null);
        
        return status;
    }
} 