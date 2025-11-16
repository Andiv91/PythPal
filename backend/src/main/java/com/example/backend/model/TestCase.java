package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "test_cases")
public class TestCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Column(length = 2000, nullable = false)
    private String inputData;

    @Column(length = 2000, nullable = false)
    private String expectedOutput;

    public TestCase() {}

    public TestCase(Activity activity, String inputData, String expectedOutput) {
        this.activity = activity;
        this.inputData = inputData;
        this.expectedOutput = expectedOutput;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }

    public String getInputData() { return inputData; }
    public void setInputData(String inputData) { this.inputData = inputData; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
}

