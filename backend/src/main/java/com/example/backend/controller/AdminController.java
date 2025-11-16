package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final ActivityRepository activityRepository;
    private final MessageRepository messageRepository;
    private final FavoriteRepository favoriteRepository;

    public AdminController(UserRepository userRepository,
                           SubmissionRepository submissionRepository,
                           ActivityRepository activityRepository,
                           MessageRepository messageRepository,
                           FavoriteRepository favoriteRepository) {
        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.activityRepository = activityRepository;
        this.messageRepository = messageRepository;
        this.favoriteRepository = favoriteRepository;
    }

    @GetMapping("/users")
    public List<User> listUsers(@RequestParam(value = "role", required = false) User.Role role) {
        if (role == null) return userRepository.findAll();
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == role)
                .toList();
    }

    @GetMapping("/users/{id}/stats")
    public ResponseEntity<Map<String, Object>> userStats(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();

        Map<String, Object> stats = new HashMap<>();
        stats.put("userId", user.getId());
        stats.put("email", user.getEmail());
        stats.put("role", user.getRole());

        if (user.getRole() == User.Role.STUDENT) {
            long solved = submissionRepository.countByStudentAndPassedTrue(user);
            stats.put("solvedCount", solved);
        } else if (user.getRole() == User.Role.TEACHER) {
            long published = activityRepository.countByTeacher(user);
            stats.put("publishedCount", published);
        }
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable Long id, @RequestParam User.Role role) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        user.setRole(role);
        return ResponseEntity.ok(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id,
                                           @RequestParam(defaultValue = "true") boolean cascade) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();

        if (cascade) {
            // Eliminar envíos y favoritos del usuario
            submissionRepository.deleteByStudent(user);
            favoriteRepository.deleteByStudent(user);
            messageRepository.deleteBySender(user);
            messageRepository.deleteByRecipient(user);

            if (user.getRole() == User.Role.TEACHER) {
                // Eliminar actividades del profesor y datos relacionados
                activityRepository.findByTeacher(user).forEach(activity -> {
                    submissionRepository.deleteByActivity(activity);
                    favoriteRepository.deleteByActivity(activity);
                    messageRepository.deleteByActivity(activity);
                });
                activityRepository.deleteByTeacher(user);
            }
        }

        userRepository.delete(user);
        return ResponseEntity.noContent().build();
    }

    public static class AdminUserRequest {
        @NotBlank @Email
        public String email;
        @NotBlank
        public String name;
        @NotBlank
        public String role; // STUDENT|TEACHER|ADMIN
    }

    @PostMapping("/users")
    public ResponseEntity<User> createOrUpdateUser(@Valid @RequestBody AdminUserRequest request) {
        User.Role targetRole = User.Role.valueOf(request.role);
        Optional<User> existing = userRepository.findByEmail(request.email);
        User user = existing.orElseGet(() -> new User(request.email, request.name, null, targetRole));
        user.setName(request.name);
        user.setRole(targetRole);
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }
}

