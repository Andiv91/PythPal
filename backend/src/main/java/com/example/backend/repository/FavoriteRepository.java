package com.example.backend.repository;

import com.example.backend.model.Activity;
import com.example.backend.model.Favorite;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByStudent(User student);
    Optional<Favorite> findByStudentAndActivity(User student, Activity activity);
    boolean existsByStudentAndActivity(User student, Activity activity);
    void deleteByStudent(User student);
    void deleteByActivity(Activity activity);
} 