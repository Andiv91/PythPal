package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private String difficulty;

    @Column(length = 2000)
    private String expectedOutput;

    @Column(length = 2000)
    private String hint;

    @Column
    private String language; // e.g., python, java, cpp (nullable para migración)

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private User teacher;

    // Si true, la evaluación usa CSV de testcases (score >= 80 pasa)
    @Column(nullable = false)
    private boolean useTestcases = false;

    // Constructors
    public Activity() {}

    public Activity(String title, String description, String difficulty, String expectedOutput, String language, User teacher) {
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.expectedOutput = expectedOutput;
        this.language = language;
        this.teacher = teacher;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    public String getHint() { return hint; }
    public void setHint(String hint) { this.hint = hint; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public User getTeacher() { return teacher; }
    public void setTeacher(User teacher) { this.teacher = teacher; }

    public boolean isUseTestcases() { return useTestcases; }
    public void setUseTestcases(boolean useTestcases) { this.useTestcases = useTestcases; }
}