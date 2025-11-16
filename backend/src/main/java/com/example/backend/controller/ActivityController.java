package com.example.backend.controller;

import com.example.backend.model.Activity;
import com.example.backend.model.TestCase;
import com.example.backend.model.User;
import com.example.backend.repository.TestCaseRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {
    private final ActivityService activityService;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;

    public ActivityController(ActivityService activityService, UserRepository userRepository, TestCaseRepository testCaseRepository) {
        this.activityService = activityService;
        this.userRepository = userRepository;
        this.testCaseRepository = testCaseRepository;
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
        activity.setUseTestcases(updatedActivity.isUseTestcases());
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

    @PostMapping("/{id}/testcases/upload-csv")
    public ResponseEntity<?> uploadTestCases(@PathVariable Long id,
                                             @RequestParam("file") MultipartFile file,
                                             @AuthenticationPrincipal OAuth2User principal) {
        Activity activity = activityService.findById(id).orElseThrow();
        String email = principal.getAttribute("email");
        User requester = userRepository.findByEmail(email).orElseThrow();
        if (!(requester.getRole() == User.Role.ADMIN || (activity.getTeacher() != null && activity.getTeacher().getId().equals(requester.getId())))) {
            return ResponseEntity.status(403).body("No autorizado");
        }
        try {
            String content = new String(file.getBytes());
            List<String> lines = content.lines()
                    .map(String::trim)
                    .filter(l -> !l.isEmpty())
                    .collect(Collectors.toList());
            if (!lines.isEmpty() && hasHeader(lines.get(0))) {
                lines = lines.subList(1, lines.size());
            }
            if (lines.size() > 100) {
                lines = lines.subList(0, 100);
            }
            testCaseRepository.deleteByActivity(activity);
            int count = 0;
            for (String line : lines) {
                if (count >= 100) break;
                String[] parts = line.split(",");
                if (parts.length < 2) continue;
                String expected = parts[parts.length - 1].trim();
                String input = String.join(" ", java.util.Arrays.stream(parts, 0, parts.length - 1)
                        .map(String::trim).toList());
                testCaseRepository.save(new TestCase(activity, input, expected));
                count++;
            }
            return ResponseEntity.ok("Testcases cargados: " + count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al procesar CSV: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/testcases")
    public ResponseEntity<List<TestCase>> listTestCases(@PathVariable Long id,
                                                        @AuthenticationPrincipal OAuth2User principal) {
        Activity activity = activityService.findById(id).orElseThrow();
        String email = principal.getAttribute("email");
        User requester = userRepository.findByEmail(email).orElseThrow();
        if (!(requester.getRole() == User.Role.ADMIN || (activity.getTeacher() != null && activity.getTeacher().getId().equals(requester.getId())))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(testCaseRepository.findByActivity(activity));
    }

    private boolean hasHeader(String firstLine) {
        String lower = firstLine.toLowerCase();
        return lower.contains("expected") || lower.contains("resultado") || lower.contains("salida");
    }
}