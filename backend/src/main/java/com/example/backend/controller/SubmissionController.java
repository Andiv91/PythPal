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
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;
    private final TestCaseRepository testCaseRepository;
    private final MessageRepository messageRepository;

    public SubmissionController(SubmissionService submissionService, UserRepository userRepository,
            ActivityRepository activityRepository, TestCaseRepository testCaseRepository, MessageRepository messageRepository) {
        this.submissionService = submissionService;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
        this.testCaseRepository = testCaseRepository;
        this.messageRepository = messageRepository;
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

        boolean passed;
        SubmissionController.GradeResult gradeResult = null;
        if (activity.isUseTestcases()) {
            gradeResult = gradeWithTestcases(activity, submissionRequest.getCode());
            int total = gradeResult.total;
            int ok = gradeResult.ok;
            int score = (int) Math.round(100.0 * ok / Math.max(1, total));
            passed = score >= 80;
            System.out.println("[SUBMIT] graded by testcases: ok=" + ok + " total=" + total + " score=" + score + " passed=" + passed);
        } else {
            passed = submissionRequest.getOutput() != null &&
                    submissionRequest.getOutput().trim().equals(activity.getExpectedOutput().trim());
        }
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

        // Si aprobó, verificar si completó todas las actividades del profesor y enviar certificado
        if (passed && activity.getTeacher() != null) {
            User teacher = activity.getTeacher();
            if (hasCompletedAllFromTeacher(student, teacher)) {
                maybeSendCertificateMessage(student, teacher, activity);
            }
        }

        SubmissionDTO dto = new SubmissionDTO(saved);
        if (gradeResult != null && gradeResult.hadError) {
            dto.setMessage("Error al ejecutar código, porfavor verifica.");
        }
        return dto;
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

    // --- Helpers for testcase-based grading ---
    private static class GradeResult { int total; int ok; boolean hadError; }

    private GradeResult gradeWithTestcases(Activity activity, String code) {
        var cases = testCaseRepository.findByActivity(activity);
        GradeResult gr = new GradeResult();
        gr.total = cases.size();
        if (cases.isEmpty()) return gr;
        for (var tc : cases) {
            String output = runWithInput(activity.getLanguage(), code, tc.getInputData());
            if (normalize(output).equals(normalize(tc.getExpectedOutput()))) gr.ok++;
        }
        return gr;
    }

    private String runWithInput(String activityLanguage, String code, String stdin) {
        String lang = mapLang(activityLanguage);
        String version = mapDefaultVersion(lang);
        String filename;
        String lower = lang == null ? "" : lang.toLowerCase();
        if (lower.startsWith("java")) filename = "Main.java";
        else if (lower.contains("cpp") || lower.contains("c++")) filename = "main.cpp";
        else if (lower.startsWith("python")) filename = "main.py";
        else filename = "main.txt";

        String pistonUrl = "https://emkc.org/api/v2/piston/execute";
        org.springframework.web.client.RestTemplate rt = new org.springframework.web.client.RestTemplate();
        java.util.Map<String, Object> body = new java.util.HashMap<>();
        body.put("language", lang);
        if (version != null && !version.isBlank()) body.put("version", version);
        body.put("files", java.util.List.of(java.util.Map.of("name", filename, "content", code)));
        body.put("stdin", stdin);
        var headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        var entity = new org.springframework.http.HttpEntity<>(body, headers);
        try {
            var resp = rt.exchange(pistonUrl, org.springframework.http.HttpMethod.POST, entity, (Class<java.util.Map<String, Object>>)(Class<?>)java.util.Map.class);
            String output = "";
            if (resp.getBody() != null && resp.getBody().get("run") != null) {
                var run = (java.util.Map<String, Object>) resp.getBody().get("run");
                if (run.get("output") != null) output = run.get("output").toString();
            }
            return output;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String mapLang(String activityLanguage) {
        if (activityLanguage == null) return "python3";
        String l = activityLanguage.toLowerCase();
        if (l.startsWith("python")) return "python3";
        if (l.startsWith("java")) return "java";
        if (l.contains("cpp") || l.contains("c++")) return "cpp";
        return "python3";
    }

    private String mapDefaultVersion(String lang) {
        if (lang == null) return null;
        String l = lang.toLowerCase();
        if (l.startsWith("python")) return "3.10.0";
        if (l.startsWith("java")) return null;
        if (l.contains("cpp") || l.contains("c++")) return null;
        return null;
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.replace("\r\n", "\n").trim();
    }

    private boolean hasCompletedAllFromTeacher(User student, User teacher) {
        var teacherActivities = activityRepository.findByTeacher(teacher);
        if (teacherActivities.isEmpty()) return false;
        var passedActivities = submissionService.findByStudent(student).stream()
                .filter(Submission::isPassed)
                .map(Submission::getActivity)
                .collect(java.util.stream.Collectors.toSet());
        return teacherActivities.stream().allMatch(passedActivities::contains);
    }

    private void maybeSendCertificateMessage(User student, User teacher, Activity referenceActivity) {
        String urlPath = "/api/certificates/teacher/" + teacher.getId() + "/student/" + student.getId();
        String content = "¡Felicidades! Tu certificado está listo. Descárgalo aquí: " + urlPath;
        boolean exists = messageRepository.findByRecipient(student).stream()
                .anyMatch(m -> content.equals(m.getContent()));
        if (exists) return;
        Message msg = new Message();
        msg.setContent(content);
        msg.setTimestamp(LocalDateTime.now());
        msg.setActivity(referenceActivity);
        msg.setSender(teacher);
        msg.setRecipient(student);
        messageRepository.save(msg);
    }
}