package com.example.backend.config;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Optional;

@Configuration
public class AdminBootstrap {

    @Bean
    CommandLineRunner ensureAdmin(UserRepository userRepository) {
        return args -> {
            String adminEmail = System.getenv("ADMIN_EMAIL");
            if (adminEmail == null || adminEmail.isEmpty()) {
                return;
            }
            Optional<User> maybe = userRepository.findByEmail(adminEmail);
            if (maybe.isPresent()) {
                User u = maybe.get();
                if (u.getRole() != User.Role.ADMIN) {
                    u.setRole(User.Role.ADMIN);
                    userRepository.save(u);
                    System.out.println("Promovido a ADMIN: " + adminEmail);
                }
            } else {
                User u = new User(adminEmail, "Administrador", null, User.Role.ADMIN);
                userRepository.save(u);
                System.out.println("Creado ADMIN: " + adminEmail);
            }
        };
    }
}

