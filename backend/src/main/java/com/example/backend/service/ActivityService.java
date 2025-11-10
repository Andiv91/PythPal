package com.example.backend.service;

import com.example.backend.model.Activity;
import com.example.backend.model.User;
import com.example.backend.repository.ActivityRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    public Activity save(Activity activity) {
        return activityRepository.save(activity);
    }

    public List<Activity> findAll() {
        return activityRepository.findAll();
    }

    public List<Activity> findByTeacher(User teacher) {
        return activityRepository.findByTeacher(teacher);
    }

    public Optional<Activity> findById(Long id) {
        return activityRepository.findById(id);
    }

    public void deleteById(Long id) {
        activityRepository.deleteById(id);
    }
}