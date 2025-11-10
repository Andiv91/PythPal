package com.example.backend.service;

import com.example.backend.model.Activity;
import com.example.backend.model.Favorite;
import com.example.backend.model.User;
import com.example.backend.repository.ActivityRepository;
import com.example.backend.repository.FavoriteRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final ActivityRepository activityRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, UserRepository userRepository, ActivityRepository activityRepository) {
        this.favoriteRepository = favoriteRepository;
        this.userRepository = userRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional
    public Favorite addFavorite(String userEmail, Long activityId) {
        User student = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));

        if (favoriteRepository.existsByStudentAndActivity(student, activity)) {
            throw new RuntimeException("Activity already marked as favorite");
        }

        Favorite favorite = new Favorite(student, activity);
        return favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String userEmail, Long activityId) {
        User student = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));

        Favorite favorite = favoriteRepository.findByStudentAndActivity(student, activity)
                .orElseThrow(() -> new RuntimeException("Favorite not found"));

        favoriteRepository.delete(favorite);
    }

    @Transactional(readOnly = true)
    public List<Favorite> getFavoritesByStudent(String userEmail) {
        User student = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        return favoriteRepository.findByStudent(student);
    }

    @Transactional(readOnly = true)
    public boolean isFavorite(String userEmail, Long activityId) {
        User student = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));
        Activity activity = activityRepository.findById(activityId)
            .orElseThrow(() -> new RuntimeException("Activity not found with id: " + activityId));
        return favoriteRepository.existsByStudentAndActivity(student, activity);
    }
} 