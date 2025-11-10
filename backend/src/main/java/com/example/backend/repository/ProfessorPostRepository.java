package com.example.backend.repository;

import com.example.backend.model.ProfessorPost;
import com.example.backend.model.ProfessorThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProfessorPostRepository extends JpaRepository<ProfessorPost, Long> {
    List<ProfessorPost> findByThreadAndParentIsNullOrderByCreatedAtDesc(ProfessorThread thread);
    List<ProfessorPost> findByParentOrderByCreatedAtAsc(ProfessorPost parent);
}


