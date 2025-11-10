package com.example.backend.repository;

import com.example.backend.model.ProfessorThread;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfessorThreadRepository extends JpaRepository<ProfessorThread, Long> {
    List<ProfessorThread> findByTeacherAndDeletedFalseOrderByCreatedAtDesc(User teacher);
}


