package com.example.backend.dto;

public class CodeExecutionRequest {
    private String language;
    private String code;
    private String version; // agrega este campo

    // Getters and setters
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}