package com.example.backend.controller;

import com.example.backend.model.Activity;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ActivityService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {
    private final ActivityService activityService;
    private final UserRepository userRepository;

    public ActivityController(ActivityService activityService, UserRepository userRepository) {
        this.activityService = activityService;
        this.userRepository = userRepository;
    }

    // List all activities
    @GetMapping
    public List<Activity> getAllActivities() {
        return activityService.findAll();
    }

    // List activities by teacher
    @GetMapping("/teacher/{teacherId}")
    public List<Activity> getActivitiesByTeacher(@PathVariable Long teacherId) {
        Optional<User> teacher = userRepository.findById(teacherId);
        return teacher.map(activityService::findByTeacher).orElse(List.of());
    }

    // Create activity (teacher only)
    @PostMapping
    public Activity createActivity(@AuthenticationPrincipal OAuth2User principal, @RequestBody Activity activity) {
        String email = principal.getAttribute("email");
        User teacher = userRepository.findByEmail(email).orElseThrow();
        activity.setTeacher(teacher);
        return activityService.save(activity);
    }

    // Edit activity (teacher only)
    @PutMapping("/{id}")
    public Activity updateActivity(@PathVariable Long id, @RequestBody Activity updatedActivity, @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        User teacher = userRepository.findByEmail(email).orElseThrow();
        Activity activity = activityService.findById(id).orElseThrow();
        if (!activity.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        activity.setTitle(updatedActivity.getTitle());
        activity.setDescription(updatedActivity.getDescription());
        activity.setDifficulty(updatedActivity.getDifficulty());
        activity.setExpectedOutput(updatedActivity.getExpectedOutput());
        activity.setHint(updatedActivity.getHint());
        activity.setLanguage(updatedActivity.getLanguage());
        return activityService.save(activity);
    }

    // Delete activity (teacher only)
    @DeleteMapping("/{id}")
    public void deleteActivity(@PathVariable Long id, @AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        User teacher = userRepository.findByEmail(email).orElseThrow();
        Activity activity = activityService.findById(id).orElseThrow();
        if (!activity.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Unauthorized");
        }
        activityService.deleteById(id);
    }
}