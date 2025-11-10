package com.example.backend.service;

import com.example.backend.dto.AuthResponse;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public AuthResponse register(RegisterRequest request) {
        // Verificar si el email ya existe
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return new AuthResponse(false, "Email ya registrado");
        }

        // Encriptar la contraseña
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        // Crear nuevo usuario
        User user = new User(
                request.getEmail(),
                request.getName(),
                encodedPassword,
                request.getRole()
        );

        // Guardar usuario
        user = userRepository.save(user);

        return new AuthResponse(true, "Usuario registrado exitosamente", user);
    }

    public AuthResponse login(LoginRequest request, String selectedRole) {
        // Buscar usuario por email
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "Email o contraseña incorrectos");
        }

        User user = userOpt.get();

        // Verificar contraseña
        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse(false, "Email o contraseña incorrectos");
        }
        
        // Verificar rol si se ha seleccionado uno
        if (selectedRole != null && !selectedRole.isEmpty()) {
            try {
                User.Role role = User.Role.valueOf(selectedRole);
                if (user.getRole() != role) {
                    return new AuthResponse(false, 
                            "No puedes iniciar sesión como " + 
                            (role == User.Role.TEACHER ? "profesor" : "estudiante") + 
                            ". Tu cuenta está registrada como " + 
                            (user.getRole() == User.Role.TEACHER ? "profesor" : "estudiante") +
                            ". Por favor, selecciona el rol correcto e intenta nuevamente.");
                }
            } catch (IllegalArgumentException e) {
                // Si el rol no es válido, ignoramos la verificación
                System.out.println("Rol seleccionado no válido: " + selectedRole);
            }
        }

        return new AuthResponse(true, "Login exitoso", user);
    }
}