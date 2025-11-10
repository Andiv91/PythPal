package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "submissions")
public class Submission {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private User student;

    @ManyToOne
    @JoinColumn(name = "activity_id")
    private Activity activity;

    @Column(length = 5000)
    private String code;

    @Column(length = 2000)
    private String output;

    private boolean passed;

    private Integer durationSeconds;

    // Constructors
    public Submission() {}

    public Submission(User student, Activity activity, String code, String output, boolean passed) {
        this.student = student;
        this.activity = activity;
        this.code = code;
        this.output = output;
        this.passed = passed;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getStudent() { return student; }
    public void setStudent(User student) { this.student = student; }

    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }

    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
}