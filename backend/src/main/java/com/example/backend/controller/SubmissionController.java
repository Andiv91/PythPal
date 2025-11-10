package com.example.backend.controller;

import com.example.backend.dto.SubmissionDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.example.backend.service.SubmissionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
// removed unused Optional import
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public SubmissionController(SubmissionService submissionService, UserRepository userRepository,
            ActivityRepository activityRepository) {
        this.submissionService = submissionService;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    // Estudiante envía una solución
    @PostMapping("/{activityId}")
    public SubmissionDTO submitSolution(
            @PathVariable Long activityId,
            @RequestBody SubmissionDTO submissionRequest) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new RuntimeException("No hay usuario autenticado (authentication/principal es null)");
        }

        Object principal = authentication.getPrincipal();
        String email = null;
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        }

        if (email == null) {
            throw new RuntimeException("No se pudo obtener el email del usuario autenticado");
        }

        User student = userRepository.findByEmail(email).orElseThrow();
        Activity activity = activityRepository.findById(activityId).orElseThrow();

        System.out.println("[SUBMIT] student=" + student.getEmail() + " activityId=" + activityId);
        System.out.println("[SUBMIT] difficulty=" + activity.getDifficulty() + " expectedOutput=\n" + activity.getExpectedOutput());
        System.out.println("[SUBMIT] code=\n" + submissionRequest.getCode());
        System.out.println("[SUBMIT] output=\n" + submissionRequest.getOutput());

        boolean passed = submissionRequest.getOutput() != null &&
                submissionRequest.getOutput().trim().equals(activity.getExpectedOutput().trim());
        System.out.println("[SUBMIT] passed=" + passed);

        // Award XP only on first successful pass for this activity (check BEFORE saving)
        int toAdd = 0;
        if (passed) {
            boolean alreadyPassed = submissionService.findByStudent(student).stream()
                .anyMatch(s -> s.getActivity().getId().equals(activity.getId()) && s.isPassed());
            System.out.println("[SUBMIT] alreadyPassedForActivity=" + alreadyPassed);
            if (!alreadyPassed) {
                String diff = String.valueOf(activity.getDifficulty());
                if ("Fácil".equalsIgnoreCase(diff) || "Facil".equalsIgnoreCase(diff)) toAdd = 5;
                else if ("Media".equalsIgnoreCase(diff)) toAdd = 10;
                else toAdd = 15; // Difícil u otros
                Integer currentXp = student.getXp();
                if (currentXp == null) currentXp = 0;
                int newXp = currentXp + toAdd;
                student.setXp(newXp);
                userRepository.save(student);
                System.out.println("[SUBMIT] XP awarded=" + toAdd + " totalXp=" + newXp);
            }
            else {
                System.out.println("[SUBMIT] No XP: activity already passed previously by this student");
            }
        }

        Submission submission = new Submission(
                student,
                activity,
                submissionRequest.getCode(),
                submissionRequest.getOutput(),
                passed);
        submission.setDurationSeconds(submissionRequest.getDurationSeconds());
        Submission saved = submissionService.save(submission);
        return new SubmissionDTO(saved);
    }

    // Ver todas las submissions de una actividad (para el profesor)
    /*
     * @GetMapping("/activity/{activityId}")
     * public List<Submission> getSubmissionsByActivity(@PathVariable Long
     * activityId) {
     * Activity activity = activityRepository.findById(activityId).orElseThrow();
     * return submissionService.findByActivity(activity);
     * }
     */

    // Ver todas las submissions de un estudiante
    /*
     * @GetMapping("/student/{studentId}")
     * public List<Submission> getSubmissionsByStudent(@PathVariable Long studentId)
     * {
     * User student = userRepository.findById(studentId).orElseThrow();
     * return submissionService.findByStudent(student);
     * }
     */

    @GetMapping("/student/{studentId}")
    public List<SubmissionDTO> getSubmissionsByStudentDtos(@PathVariable Long studentId) {
        User student = userRepository.findById(studentId).orElseThrow();
        List<Submission> submissions = submissionService.findByStudent(student);
        return submissions.stream().map(SubmissionDTO::new).collect(Collectors.toList());
    }

    @GetMapping("/activity/{activityId}")
    public List<SubmissionDTO> getSubmissionsByActivityDtos(@PathVariable Long activityId) {
        Activity activity = activityRepository.findById(activityId).orElseThrow();
        List<Submission> submissions = submissionService.findByActivity(activity);
        return submissions.stream().map(SubmissionDTO::new).collect(Collectors.toList());
    }
}