package com.example.backend.controller;

import com.example.backend.dto.CodeExecutionRequest;
import com.example.backend.dto.CodeExecutionResponse;
import com.example.backend.model.Activity;
import com.example.backend.model.TestCase;
import com.example.backend.repository.ActivityRepository;
import com.example.backend.repository.TestCaseRepository;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/python")
public class CodeExecutionController {

    private final TestCaseRepository testCaseRepository;
    private final ActivityRepository activityRepository;

    public CodeExecutionController(TestCaseRepository testCaseRepository, ActivityRepository activityRepository) {
        this.testCaseRepository = testCaseRepository;
        this.activityRepository = activityRepository;
    }

    @PostMapping("/execute")
    public CodeExecutionResponse executePythonCode(@RequestBody CodeExecutionRequest request) {
        String pistonUrl = "https://emkc.org/api/v2/piston/execute";
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();
        String lang = request.getLanguage();
        body.put("language", lang);
        String version = request.getVersion();
        if (version == null || version.isBlank()) {
            if (lang != null) {
                String lower = lang.toLowerCase();
                if (lower.startsWith("python")) version = "3.10.0";
                else if (lower.startsWith("java")) version = "15.0.2";
                else if (lower.contains("cpp") || lower.contains("c++")) version = "10.2.0"; // GCC version commonly used
            }
        }
        if (version != null && !version.isBlank()) {
            body.put("version", version);
        }

        // Piston requiere nombre de archivo para lenguajes compilados como Java/C++
        String filename;
        if (lang != null && lang.toLowerCase().startsWith("java")) {
            filename = "Main.java";
        } else if (lang != null && (lang.equalsIgnoreCase("cpp") || lang.toLowerCase().contains("c++") || lang.toLowerCase().contains("cpp"))) {
            filename = "main.cpp";
        } else if (lang != null && lang.toLowerCase().startsWith("python")) {
            filename = "main.py";
        } else {
            filename = "main.txt"; // fallback
        }
        body.put("files", List.of(Map.of("name", filename, "content", request.getCode())));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    pistonUrl,
                    HttpMethod.POST,
                    entity,
                    (Class<Map<String, Object>>)(Class<?>)Map.class);

            System.out.println("Piston response: " + response.getBody());

            String output = "";
            if (response.getBody() != null && response.getBody().get("run") != null) {
                Map<String, Object> run = (Map<String, Object>) response.getBody().get("run");
                if (run.get("output") != null) {
                    output = run.get("output").toString();
                }
            }
            return new CodeExecutionResponse(output);
        } catch (Exception e) {
            e.printStackTrace();
            return new CodeExecutionResponse("Error: " + e.getMessage());
        }
    }

    public static class BatchRequest {
        public String language;
        public String code;
        public String version;
        public Long activityId;
    }

    public static class BatchCaseResult {
        public int index;
        public String input;
        public String expected;
        public String output;
        public boolean pass;
        public long durationMs;
    }

    public static class BatchResponse {
        public int total;
        public int passed;
        public int score;
        public List<BatchCaseResult> results;
    }

    @PostMapping("/execute-batch")
    public ResponseEntity<BatchResponse> executeBatch(@RequestBody BatchRequest request) {
        if (request.activityId == null) {
            return ResponseEntity.badRequest().build();
        }
        Optional<Activity> activityOpt = activityRepository.findById(request.activityId);
        if (activityOpt.isEmpty()) return ResponseEntity.ok(emptyBatch());

        List<TestCase> cases = testCaseRepository.findByActivity(activityOpt.get());
        if (cases.isEmpty()) return ResponseEntity.ok(emptyBatch());

        List<BatchCaseResult> results = new ArrayList<>();
        int passed = 0;
        for (int i = 0; i < cases.size(); i++) {
            TestCase tc = cases.get(i);
            long start = System.currentTimeMillis();
            String output = runWithInput(request.language, request.version, request.code, tc.getInputData());
            long duration = System.currentTimeMillis() - start;
            String normOut = normalize(output);
            String normExp = normalize(tc.getExpectedOutput());
            boolean ok = normOut.equals(normExp);
            if (ok) passed++;
            BatchCaseResult r = new BatchCaseResult();
            r.index = i + 1;
            r.input = tc.getInputData();
            r.expected = tc.getExpectedOutput();
            r.output = output;
            r.pass = ok;
            r.durationMs = duration;
            results.add(r);
        }
        BatchResponse resp = new BatchResponse();
        resp.total = cases.size();
        resp.passed = passed;
        resp.score = (int) Math.round(100.0 * passed / Math.max(1, cases.size()));
        resp.results = results;
        return ResponseEntity.ok(resp);
    }

    private String runWithInput(String language, String version, String code, String stdin) {
        String pistonUrl = "https://emkc.org/api/v2/piston/execute";
        RestTemplate restTemplate = new RestTemplate();
        Map<String, Object> body = new HashMap<>();
        String lang = language;
        body.put("language", lang);
        String ver = version;
        if (ver == null || ver.isBlank()) {
            if (lang != null) {
                String lower = lang.toLowerCase();
                if (lower.startsWith("python")) ver = "3.10.0";
                else if (lower.startsWith("java")) ver = "15.0.2";
                else if (lower.contains("cpp") || lower.contains("c++")) ver = "10.2.0";
            }
        }
        if (ver != null && !ver.isBlank()) {
            body.put("version", ver);
        }
        String filename;
        if (lang != null && lang.toLowerCase().startsWith("java")) {
            filename = "Main.java";
        } else if (lang != null && (lang.equalsIgnoreCase("cpp") || lang.toLowerCase().contains("c++") || lang.toLowerCase().contains("cpp"))) {
            filename = "main.cpp";
        } else if (lang != null && lang.toLowerCase().startsWith("python")) {
            filename = "main.py";
        } else {
            filename = "main.txt";
        }
        body.put("files", List.of(Map.of("name", filename, "content", code)));
        body.put("stdin", stdin);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(pistonUrl, HttpMethod.POST, entity, (Class<Map<String, Object>>)(Class<?>)Map.class);
            String output = "";
            if (response.getBody() != null && response.getBody().get("run") != null) {
                Map<String, Object> run = (Map<String, Object>) response.getBody().get("run");
                if (run.get("output") != null) {
                    output = run.get("output").toString();
                }
            }
            return output;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

    private String normalize(String s) {
        if (s == null) return "";
        return s.replace("\r\n", "\n").trim();
    }

    private BatchResponse emptyBatch() {
        BatchResponse r = new BatchResponse();
        r.total = 0;
        r.passed = 0;
        r.score = 0;
        r.results = List.of();
        return r;
    }
}