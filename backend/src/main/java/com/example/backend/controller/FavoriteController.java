package com.example.backend.controller;

import com.example.backend.dto.ActivityDTO;
import com.example.backend.model.Favorite;
import com.example.backend.service.FavoriteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {

    private final FavoriteService favoriteService;

    public FavoriteController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @PostMapping("/{activityId}")
    public ResponseEntity<ActivityDTO> addFavorite(@PathVariable Long activityId, @AuthenticationPrincipal OAuth2User principal) {
        String userEmail = principal.getAttribute("email");
        Favorite favorite = favoriteService.addFavorite(userEmail, activityId);
        return ResponseEntity.status(HttpStatus.CREATED).body(new ActivityDTO(favorite.getActivity()));
    }

    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> removeFavorite(@PathVariable Long activityId, @AuthenticationPrincipal OAuth2User principal) {
        String userEmail = principal.getAttribute("email");
        favoriteService.removeFavorite(userEmail, activityId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/me")
    public ResponseEntity<List<ActivityDTO>> getStudentFavorites(@AuthenticationPrincipal OAuth2User principal) {
        String userEmail = principal.getAttribute("email");
        List<Favorite> favorites = favoriteService.getFavoritesByStudent(userEmail);
        List<ActivityDTO> favoriteActivities = favorites.stream()
                .map(favorite -> new ActivityDTO(favorite.getActivity()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(favoriteActivities);
    }

    @GetMapping("/{activityId}/status")
    public ResponseEntity<Boolean> isFavorite(@PathVariable Long activityId, @AuthenticationPrincipal OAuth2User principal) {
        String userEmail = principal.getAttribute("email");
        boolean isFavorite = favoriteService.isFavorite(userEmail, activityId);
        return ResponseEntity.ok(isFavorite);
    }
} 