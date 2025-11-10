package com.example.backend.controller;

import com.example.backend.dto.CodeExecutionRequest;
import com.example.backend.dto.CodeExecutionResponse;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/python")
public class CodeExecutionController {

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
            ResponseEntity<Map> response = restTemplate.exchange(
                    pistonUrl,
                    HttpMethod.POST,
                    entity,
                    Map.class);

            System.out.println("Piston response: " + response.getBody());

            String output = "";
            if (response.getBody() != null && response.getBody().get("run") != null) {
                Map run = (Map) response.getBody().get("run");
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
}