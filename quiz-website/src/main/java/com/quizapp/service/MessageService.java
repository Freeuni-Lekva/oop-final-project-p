package com.quizapp.service;

import com.quizapp.model.Message;
import com.quizapp.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    @Autowired
    private MessageRepository messageRepository;

    public Message sendMessage(String senderUsername, String receiverUsername, String content) {
        Message message = new Message(senderUsername, receiverUsername, content, LocalDateTime.now());
        return messageRepository.save(message);
    }

    public List<Message> getLatestMessagesForReceiver(String receiverUsername) {
        return messageRepository.findLatestMessagesForReceiver(receiverUsername);
    }
}