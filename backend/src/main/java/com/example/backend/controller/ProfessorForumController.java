package com.example.backend.controller;

import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/professor-forum")
public class ProfessorForumController {
    private final UserRepository userRepository;
    private final ProfessorThreadRepository threadRepository;
    private final ProfessorPostRepository postRepository;
    private final ProfessorVoteRepository voteRepository;

    public ProfessorForumController(UserRepository userRepository,
                                    ProfessorThreadRepository threadRepository,
                                    ProfessorPostRepository postRepository,
                                    ProfessorVoteRepository voteRepository) {
        this.userRepository = userRepository;
        this.threadRepository = threadRepository;
        this.postRepository = postRepository;
        this.voteRepository = voteRepository;
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Map<String, Object>> listThreads(@PathVariable Long teacherId) {
        User teacher = userRepository.findById(teacherId).orElseThrow();
        return threadRepository.findByTeacherAndDeletedFalseOrderByCreatedAtDesc(teacher).stream()
                .map(t -> Map.of(
                        "id", t.getId(),
                        "title", t.getTitle(),
                        "content", t.getContent(),
                        "author", toUserMap(t.getAuthor()),
                        "createdAt", t.getCreatedAt()
                )).collect(Collectors.toList());
    }

    @PostMapping("/teacher/{teacherId}")
    public Map<String, Object> createThread(@AuthenticationPrincipal OAuth2User principal,
                                            @PathVariable Long teacherId,
                                            @RequestBody Map<String, String> body) {
        String email = principal.getAttribute("email");
        User author = userRepository.findByEmail(email).orElseThrow();
        User teacher = userRepository.findById(teacherId).orElseThrow();
        ProfessorThread t = new ProfessorThread();
        t.setAuthor(author);
        t.setTeacher(teacher);
        t.setTitle(body.getOrDefault("title", ""));
        t.setContent(body.getOrDefault("content", ""));
        ProfessorThread saved = threadRepository.save(t);
        return Map.of("id", saved.getId());
    }

    @GetMapping("/thread/{threadId}")
    public Map<String, Object> getThread(@PathVariable Long threadId) {
        ProfessorThread thread = threadRepository.findById(threadId).orElseThrow();
        List<ProfessorPost> roots = postRepository.findByThreadAndParentIsNullOrderByCreatedAtDesc(thread);
        return Map.of(
                "id", thread.getId(),
                "title", thread.getTitle(),
                "content", thread.getContent(),
                "author", toUserMap(thread.getAuthor()),
                "createdAt", thread.getCreatedAt(),
                "posts", roots.stream().map(this::postToTree).collect(Collectors.toList())
        );
    }

    @PostMapping("/thread/{threadId}/post")
    public Map<String, Object> addPost(@AuthenticationPrincipal OAuth2User principal,
                                       @PathVariable Long threadId,
                                       @RequestBody Map<String, Object> body) {
        String email = principal.getAttribute("email");
        User author = userRepository.findByEmail(email).orElseThrow();
        ProfessorThread thread = threadRepository.findById(threadId).orElseThrow();
        System.out.println("[FORUM] addPost threadId=" + threadId + " author=" + author.getEmail());
        System.out.println("[FORUM] body=" + body);
        ProfessorPost p = new ProfessorPost();
        p.setThread(thread);
        p.setAuthor(author);
        p.setContent(String.valueOf(body.getOrDefault("content", "")));
        if (body.containsKey("parentId")) {
            Long parentId = Long.valueOf(String.valueOf(body.get("parentId")));
            ProfessorPost parent = postRepository.findById(parentId).orElseThrow();
            p.setParent(parent);
        }
        ProfessorPost saved = postRepository.save(p);
        System.out.println("[FORUM] saved post id=" + saved.getId());
        return Map.of("id", saved.getId());
    }

    @PostMapping("/post/{postId}/vote")
    public void vote(@AuthenticationPrincipal OAuth2User principal,
                     @PathVariable Long postId,
                     @RequestParam int value) {
        if (value != 1 && value != -1) throw new RuntimeException("Invalid vote");
        String email = principal.getAttribute("email");
        User voter = userRepository.findByEmail(email).orElseThrow();
        ProfessorPost post = postRepository.findById(postId).orElseThrow();
        Optional<ProfessorVote> existing = voteRepository.findByPostAndVoter(post, voter);
        if (existing.isPresent()) {
            ProfessorVote v = existing.get();
            if (v.getValue() == value) {
                // mismo voto, no cambia
                return;
            }
            // cambiar voto: restar el anterior y sumar el nuevo
            post.setScore(post.getScore() - v.getValue());
            v.setValue(value);
            post.setScore(post.getScore() + value);
            voteRepository.save(v);
            postRepository.save(post);
        } else {
            ProfessorVote v = new ProfessorVote();
            v.setPost(post);
            v.setVoter(voter);
            v.setValue(value);
            post.setScore(post.getScore() + value);
            voteRepository.save(v);
            postRepository.save(post);
        }
    }

    @DeleteMapping("/thread/{threadId}")
    public void deleteThread(@AuthenticationPrincipal OAuth2User principal,
                             @PathVariable Long threadId) {
        String email = principal.getAttribute("email");
        User me = userRepository.findByEmail(email).orElseThrow();
        ProfessorThread thread = threadRepository.findById(threadId).orElseThrow();
        if (!thread.getTeacher().getId().equals(me.getId())) throw new RuntimeException("No autorizado");
        thread.setDeleted(true);
        threadRepository.save(thread);
    }

    private Map<String, Object> toUserMap(User u) {
        return Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail());
    }

    private Map<String, Object> postToTree(ProfessorPost p) {
        List<ProfessorPost> children = postRepository.findByParentOrderByCreatedAtAsc(p);
        return Map.of(
                "id", p.getId(),
                "content", p.getContent(),
                "author", toUserMap(p.getAuthor()),
                "createdAt", p.getCreatedAt(),
                "score", p.getScore(),
                "replies", children.stream().map(this::postToTree).collect(Collectors.toList())
        );
    }
}


