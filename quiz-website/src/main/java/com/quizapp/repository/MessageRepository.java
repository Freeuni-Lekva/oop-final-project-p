package com.quizapp.repository;

import com.quizapp.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Find the latest message from each sender to the given receiver
    @Query("SELECT m FROM Message m WHERE m.receiverUsername = :receiverUsername AND m.timestamp = (SELECT MAX(m2.timestamp) FROM Message m2 WHERE m2.senderUsername = m.senderUsername AND m2.receiverUsername = :receiverUsername)")
    List<Message> findLatestMessagesForReceiver(@Param("receiverUsername") String receiverUsername);

    // Find all messages between two users (for future use)
    List<Message> findBySenderUsernameAndReceiverUsernameOrderByTimestampDesc(String senderUsername, String receiverUsername);
} 