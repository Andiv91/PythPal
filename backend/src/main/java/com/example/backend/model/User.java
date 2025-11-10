package com.example.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    private String name;

    private String password;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private Role role;

    private Integer xp;

    public enum Role {
        STUDENT,
        TEACHER,
        ADMIN
    }

    // Constructors
    public User() {}

    public User(String email, String name, String password, Role role) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
    }

    public User(String email, String name, String password, String imageUrl, Role role) {
        this.email = email;
        this.name = name;
        this.password = password;
        this.imageUrl = imageUrl;
        this.role = role;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public Integer getXp() { return xp; }
    public void setXp(Integer xp) { this.xp = xp; }
}