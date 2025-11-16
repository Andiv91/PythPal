package com.example.backend.repository;

import com.example.backend.model.Activity;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByTeacher(User teacher);
    long countByTeacher(User teacher);
    void deleteByTeacher(User teacher);
}