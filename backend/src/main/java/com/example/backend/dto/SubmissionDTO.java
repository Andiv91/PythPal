package com.example.backend.dto;

import com.example.backend.model.Submission;

public class SubmissionDTO {
    private Long id;
    private UserDTO student;
    private ActivityDTO activity;
    private String code;
    private String output;
    private boolean passed;
    private Integer durationSeconds;
    private String message;

    public SubmissionDTO() {}

    public SubmissionDTO(Submission submission) {
        this.id = submission.getId();
        this.student = new UserDTO(submission.getStudent());
        this.activity = new ActivityDTO(submission.getActivity());
        this.code = submission.getCode();
        this.output = submission.getOutput();
        this.passed = submission.isPassed();
        this.durationSeconds = submission.getDurationSeconds();
    }

    public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public UserDTO getStudent() { return student; }
public void setStudent(UserDTO student) { this.student = student; }

public ActivityDTO getActivity() { return activity; }
public void setActivity(ActivityDTO activity) { this.activity = activity; }

public String getCode() { return code; }
public void setCode(String code) { this.code = code; }

public String getOutput() { return output; }
public void setOutput(String output) { this.output = output; }

public boolean isPassed() { return passed; }
public void setPassed(boolean passed) { this.passed = passed; }

public Integer getDurationSeconds() { return durationSeconds; }
public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }

public String getMessage() { return message; }
public void setMessage(String message) { this.message = message; }
}