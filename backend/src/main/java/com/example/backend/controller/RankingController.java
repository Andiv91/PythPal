package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ranking")
public class RankingController {
    private final UserRepository userRepository;

    public RankingController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<Map<String, Object>> globalRanking() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(u -> u.getRole() == User.Role.STUDENT)
                .sorted((a, b) -> Integer.compare(b.getXp() == null ? 0 : b.getXp(), a.getXp() == null ? 0 : a.getXp()))
                .limit(50)
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getName());
                    m.put("xp", u.getXp() == null ? 0 : u.getXp());
                    return m;
                })
                .collect(Collectors.toList());
    }
}


