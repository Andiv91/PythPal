package com.example.backend.controller;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        System.out.println("Recibida solicitud de registro: " + request.getEmail());
        AuthResponse response = userService.register(request);
        System.out.println("Registro completado: " + response.isSuccess());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request, 
            @RequestParam(required = false) String role,
            HttpServletRequest servletRequest) {
        
        System.out.println("Recibida solicitud de login: " + request.getEmail() + " con rol: " + role);
        
        AuthResponse response = userService.login(request, role);
        
        // Si el login es exitoso, autenticar manualmente al usuario
        if (response.isSuccess()) {
            // Crear una colección de authorities basada en el rol del usuario
            SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + response.getRole().name());
            
            // Crear un objeto Authentication con los detalles del usuario
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                response.getEmail(),
                null, // No necesitamos la contraseña aquí
                Collections.singleton(authority)
            );
            
            // Establecer la autenticación en el contexto de seguridad
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Asegurar que la sesión se guarde
            HttpSession session = servletRequest.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", SecurityContextHolder.getContext());
            
            System.out.println("Usuario autenticado: " + response.getEmail() + " con rol: " + response.getRole());
        } else {
            System.out.println("Fallo en la autenticación: " + response.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/set-role")
    public ResponseEntity<String> setRoleForOAuth(@RequestParam User.Role role, HttpServletRequest request) {
        System.out.println("Estableciendo rol para OAuth: " + role);
        // Guardar el rol seleccionado en la sesión para que lo use OAuth2
        HttpSession session = request.getSession(true);
        session.setAttribute("selectedRole", role.name());
        return ResponseEntity.ok("Rol establecido: " + role);
    }
} 