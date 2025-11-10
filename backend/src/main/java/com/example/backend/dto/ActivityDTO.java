package com.example.backend.dto;

import com.example.backend.model.Activity;

public class ActivityDTO {
    private Long id;
    private String title;
    private String description;
    private String difficulty;
    private String language;
    private UserDTO teacher;

    public ActivityDTO() {}

    public ActivityDTO(Activity activity) {
        this.id = activity.getId();
        this.title = activity.getTitle();
        this.description = activity.getDescription();
        this.difficulty = activity.getDifficulty();
        this.language = activity.getLanguage();
        this.teacher = new UserDTO(activity.getTeacher());
    }

    public Long getId() { return id; }
public void setId(Long id) { this.id = id; }

public String getTitle() { return title; }
public void setTitle(String title) { this.title = title; }

public String getDescription() { return description; }
public void setDescription(String description) { this.description = description; }

public String getDifficulty() { return difficulty; }
public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

public String getLanguage() { return language; }
public void setLanguage(String language) { this.language = language; }

public UserDTO getTeacher() { return teacher; }
public void setTeacher(UserDTO teacher) { this.teacher = teacher; }
}