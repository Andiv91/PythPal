package com.example.backend.repository;

import com.example.backend.model.Message;
import com.example.backend.model.User;
import com.example.backend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByRecipient(User recipient);
    List<Message> findBySender(User sender);
    List<Message> findByActivity(Activity activity);
    List<Message> findByRecipientAndActivity(User recipient, Activity activity);
    void deleteBySender(User sender);
    void deleteByRecipient(User recipient);
    void deleteByActivity(Activity activity);
} 