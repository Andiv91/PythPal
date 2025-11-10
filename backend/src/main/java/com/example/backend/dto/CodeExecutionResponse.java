package com.example.backend.dto;

public class CodeExecutionResponse {
    private String output;

    public CodeExecutionResponse() {}
    public CodeExecutionResponse(String output) { this.output = output; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }
}