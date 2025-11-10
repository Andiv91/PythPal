package com.example.backend.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "professor_posts")
public class ProfessorPost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "thread_id")
    private ProfessorThread thread;

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private ProfessorPost parent;

    @Column(nullable = false, length = 4000)
    private String content;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    private int score = 0;
    private boolean deleted = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ProfessorThread getThread() { return thread; }
    public void setThread(ProfessorThread thread) { this.thread = thread; }
    public User getAuthor() { return author; }
    public void setAuthor(User author) { this.author = author; }
    public ProfessorPost getParent() { return parent; }
    public void setParent(ProfessorPost parent) { this.parent = parent; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}


