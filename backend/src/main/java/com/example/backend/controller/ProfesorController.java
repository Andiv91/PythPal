package com.example.backend.controller;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.ActivityRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;
import com.example.backend.model.User;

@RestController
@RequestMapping("/api/profesores")
public class ProfesorController {
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public ProfesorController(UserRepository userRepository, ActivityRepository activityRepository) {
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    @GetMapping
    public List<Map<String, Object>> getProfesores() {
        List<Map<String, Object>> profesores = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.TEACHER)
                .map(u -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", u.getId());
                    String safeName = (u.getName() != null && !u.getName().isBlank()) ? u.getName() : u.getEmail();
                    map.put("name", safeName == null ? "Profesor" : safeName);
                    map.put("avatarUrl", "");
                    var activities = activityRepository.findByTeacher(u);
                    map.put("ejerciciosCount", activities.size());
                    // Distinct languages used by this professor
                    List<String> languages = activities.stream()
                            .map(a -> a.getLanguage() == null ? null : a.getLanguage().toLowerCase())
                            .filter(Objects::nonNull)
                            .distinct()
                            .toList();
                    map.put("languages", languages);
                    return map;
                })
                .collect(Collectors.toList());

        profesores.sort(Comparator.comparing(m -> String.valueOf(m.getOrDefault("name", "")).toLowerCase()));
        return profesores;
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProfesor(@PathVariable Long id) {
        User u = userRepository.findById(id).orElseThrow();
        if (u.getRole() != User.Role.TEACHER) {
            throw new RuntimeException("Usuario no es profesor");
        }
        Map<String, Object> map = new HashMap<>();
        String safeName = (u.getName() != null && !u.getName().isBlank()) ? u.getName() : u.getEmail();
        map.put("id", u.getId());
        map.put("name", safeName == null ? "Profesor" : safeName);
        map.put("avatarUrl", "");
        var activities = activityRepository.findByTeacher(u);
        map.put("ejerciciosCount", activities.size());
        List<String> languages = activities.stream()
                .map(a -> a.getLanguage() == null ? null : a.getLanguage().toLowerCase())
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        map.put("languages", languages);
        return map;
    }
}