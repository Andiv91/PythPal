package com.example.backend.repository;

import com.example.backend.model.Activity;
import com.example.backend.model.TestCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestCaseRepository extends JpaRepository<TestCase, Long> {
    List<TestCase> findByActivity(Activity activity);
    long countByActivity(Activity activity);
    void deleteByActivity(Activity activity);
}

