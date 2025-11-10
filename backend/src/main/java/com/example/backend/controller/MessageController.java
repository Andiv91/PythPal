package com.example.backend.controller;

import com.example.backend.dto.MessageDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ActivityRepository activityRepository;

    // Enviar mensaje (estudiante -> profesor)
    @PostMapping
    public MessageDTO sendMessage(@RequestBody MessageDTO dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new RuntimeException("No hay usuario autenticado");
        }
        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        }
        if (email == null) throw new RuntimeException("No se pudo obtener el email del usuario autenticado");
        User sender = userRepository.findByEmail(email).orElseThrow();
        User recipient = userRepository.findById(dto.getRecipientId()).orElseThrow();
        Activity activity = activityRepository.findById(dto.getActivityId()).orElseThrow();

        Message message = new Message();
        message.setContent(dto.getContent());
        message.setTimestamp(LocalDateTime.now());
        message.setActivity(activity);
        message.setSender(sender);
        message.setRecipient(recipient);
        message = messageRepository.save(message);

        return toDTO(message);
    }

    // Consultar mensajes recibidos por el profesor autenticado
    @GetMapping("/received")
    public List<MessageDTO> getReceivedMessages() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new RuntimeException("No hay usuario autenticado");
        }
        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        }
        if (email == null) throw new RuntimeException("No se pudo obtener el email del usuario autenticado");
        User recipient = userRepository.findByEmail(email).orElseThrow();
        List<Message> messages = messageRepository.findByRecipient(recipient);
        return messages.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Consultar mensajes enviados por el estudiante autenticado
    @GetMapping("/sent")
    public List<MessageDTO> getSentMessages() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new RuntimeException("No hay usuario autenticado");
        }
        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        }
        if (email == null) throw new RuntimeException("No se pudo obtener el email del usuario autenticado");
        User sender = userRepository.findByEmail(email).orElseThrow();
        List<Message> messages = messageRepository.findBySender(sender);
        return messages.stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Obtener la conversación tipo chat entre el usuario autenticado y otro usuario para un ejercicio
    @GetMapping("/conversation")
    public List<MessageDTO> getConversation(@RequestParam Long activityId, @RequestParam Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new RuntimeException("No hay usuario autenticado");
        }
        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        }
        if (email == null) throw new RuntimeException("No se pudo obtener el email del usuario autenticado");
        User me = userRepository.findByEmail(email).orElseThrow();
        User other = userRepository.findById(userId).orElseThrow();
        Activity activity = activityRepository.findById(activityId).orElseThrow();

        // Buscar todos los mensajes entre ambos usuarios para ese ejercicio
        List<Message> all = messageRepository.findByActivity(activity);
        List<Message> conversation = all.stream()
            .filter(m -> (m.getSender().getId().equals(me.getId()) && m.getRecipient().getId().equals(other.getId()))
                      || (m.getSender().getId().equals(other.getId()) && m.getRecipient().getId().equals(me.getId())))
            .sorted((a, b) -> a.getTimestamp().compareTo(b.getTimestamp()))
            .toList();
        return conversation.stream().map(this::toDTO).toList();
    }

    // Borrar toda la conversación entre el usuario autenticado y otro usuario para un ejercicio
    @DeleteMapping("/conversation")
    public void deleteConversation(@RequestParam Long activityId, @RequestParam Long userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new RuntimeException("No hay usuario autenticado");
        }
        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof OAuth2User) {
            email = ((OAuth2User) principal).getAttribute("email");
        } else if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            email = (String) principal;
        }
        if (email == null) throw new RuntimeException("No se pudo obtener el email del usuario autenticado");
        User me = userRepository.findByEmail(email).orElseThrow();
        User other = userRepository.findById(userId).orElseThrow();
        Activity activity = activityRepository.findById(activityId).orElseThrow();

        List<Message> all = messageRepository.findByActivity(activity);
        List<Message> conversation = all.stream()
            .filter(m -> (m.getSender().getId().equals(me.getId()) && m.getRecipient().getId().equals(other.getId()))
                      || (m.getSender().getId().equals(other.getId()) && m.getRecipient().getId().equals(me.getId())))
            .toList();
        messageRepository.deleteAll(conversation);
    }

    private MessageDTO toDTO(Message m) {
        return new MessageDTO(
                m.getId(),
                m.getContent(),
                m.getTimestamp(),
                m.getActivity().getId(),
                m.getActivity().getTitle(),
                m.getSender().getId(),
                m.getSender().getName(),
                m.getRecipient().getId(),
                m.getRecipient().getName()
        );
    }
} 