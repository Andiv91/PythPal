package com.example.backend.service;

import com.example.backend.model.Submission;
import com.example.backend.model.Activity;
import com.example.backend.model.User;
import com.example.backend.repository.SubmissionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;

    public SubmissionService(SubmissionRepository submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    public Submission save(Submission submission) {
        return submissionRepository.save(submission);
    }

    public List<Submission> findByActivity(Activity activity) {
        return submissionRepository.findByActivity(activity);
    }

    public List<Submission> findByStudent(User student) {
        return submissionRepository.findByStudent(student);
    }

    public Optional<Submission> findById(Long id) {
        return submissionRepository.findById(id);
    }
}