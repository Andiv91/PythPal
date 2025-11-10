package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "professor_votes", uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "voter_id"}))
public class ProfessorVote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private ProfessorPost post;

    @ManyToOne
    @JoinColumn(name = "voter_id")
    private User voter;

    private int value; // +1 or -1

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProfessorPost getPost() { return post; }
    public void setPost(ProfessorPost post) { this.post = post; }
    public User getVoter() { return voter; }
    public void setVoter(User voter) { this.voter = voter; }
    public int getValue() { return value; }
    public void setValue(int value) { this.value = value; }
}


