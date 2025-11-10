package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        System.out.println("Verificando usuario autenticado...");
        System.out.println("Autenticación en SecurityContext: " + SecurityContextHolder.getContext().getAuthentication());
        
        if (principal == null) {
            System.out.println("Principal es null, verificando autenticación por email");
            // Si principal es null, puede ser porque el usuario se autenticó con username/password
            // y no con OAuth2. Intentemos obtener el username del contexto de seguridad.
            String email = null;
            if (SecurityContextHolder.getContext().getAuthentication() != null) {
                email = SecurityContextHolder.getContext().getAuthentication().getName();
                System.out.println("Email encontrado en SecurityContext: " + email);
            }
            
            if (email != null) {
                User user = userRepository.findByEmail(email).orElse(null);
                System.out.println("Usuario encontrado por email: " + (user != null));
                return user;
            }
            
            System.out.println("No se pudo obtener el usuario autenticado");
            return null;
        }
        
        String email = principal.getAttribute("email");
        System.out.println("Email del principal OAuth2: " + email);
        return userRepository.findByEmail(email).orElse(null);
    }

    @PostMapping("/role")
    public User setRole(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestParam User.Role role) {
        String email = principal.getAttribute("email");
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole(role);
            return userRepository.save(user);
        }
        throw new RuntimeException("User not found");
    }

    @PutMapping("/me")
    public User updateCurrentUser(
            @AuthenticationPrincipal OAuth2User principal,
            @RequestBody User updateRequest) {
        String email = principal != null ? principal.getAttribute("email") : null;
        if (email == null && SecurityContextHolder.getContext().getAuthentication() != null) {
            email = SecurityContextHolder.getContext().getAuthentication().getName();
        }
        if (email == null) throw new RuntimeException("No autenticado");

        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(updateRequest.getName());
        return userRepository.save(user);
    }
}