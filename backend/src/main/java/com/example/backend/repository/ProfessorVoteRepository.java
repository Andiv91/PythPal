package com.example.backend.repository;

import com.example.backend.model.ProfessorPost;
import com.example.backend.model.ProfessorVote;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfessorVoteRepository extends JpaRepository<ProfessorVote, Long> {
    Optional<ProfessorVote> findByPostAndVoter(ProfessorPost post, User voter);
}


