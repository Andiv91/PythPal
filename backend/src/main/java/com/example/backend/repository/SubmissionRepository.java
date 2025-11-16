package com.example.backend.repository;

import com.example.backend.model.Submission;
import com.example.backend.model.Activity;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByActivity(Activity activity);
    List<Submission> findByStudent(User student);
    long countByStudentAndPassedTrue(User student);
    void deleteByStudent(User student);
    void deleteByActivity(Activity activity);
}