package com.example.backend.controller;

import com.example.backend.dto.SubmissionDTO;
import com.example.backend.model.Activity;
import com.example.backend.model.User;
import com.example.backend.repository.ActivityRepository;
import com.example.backend.repository.SubmissionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
    private final SubmissionRepository submissionRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public ProgressController(SubmissionRepository submissionRepository, ActivityRepository activityRepository, UserRepository userRepository) {
        this.submissionRepository = submissionRepository;
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public Map<String, Object> myProgress(@AuthenticationPrincipal OAuth2User principal) {
        String email = principal.getAttribute("email");
        User me = userRepository.findByEmail(email).orElseThrow();

        List<Activity> allActivities = activityRepository.findAll();
        List<com.example.backend.model.Submission> mySubs = submissionRepository.findByStudent(me);

        // Count completed (passed) activities distinct
        Set<Long> passedActivities = mySubs.stream()
                .filter(com.example.backend.model.Submission::isPassed)
                .map(s -> s.getActivity().getId())
                .collect(Collectors.toSet());

        // Duration per activity (take best/first pass)
        Map<Long, Integer> bestDurations = new HashMap<>();
        for (com.example.backend.model.Submission s : mySubs) {
            if (s.isPassed() && s.getDurationSeconds() != null) {
                bestDurations.merge(s.getActivity().getId(), s.getDurationSeconds(), Math::min);
            }
        }

        int totalCompleted = passedActivities.size();
        int totalActivities = allActivities.size();
        double completionPercent = totalActivities == 0 ? 0.0 : (totalCompleted * 100.0 / totalActivities);

        int xp = me.getXp() == null ? 0 : me.getXp();
        // Leveling: level 1 = 20, then +20 per level
        int level = 0;
        int threshold = 20;
        int remainingXp = xp;
        while (remainingXp >= threshold) {
            remainingXp -= threshold;
            level++;
            threshold += 20;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("xp", xp);
        result.put("level", level);
        result.put("completedCount", totalCompleted);
        result.put("totalActivities", totalActivities);
        result.put("completionPercent", completionPercent);
        result.put("bestDurations", bestDurations); // {activityId: seconds}
        result.put("submissions", mySubs.stream().map(SubmissionDTO::new).collect(Collectors.toList()));
        return result;
    }
}


