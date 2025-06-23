package com.quizapp.controller;

import com.quizapp.model.Message;
import com.quizapp.service.MessageService;
import com.quizapp.service.UserService;
import com.quizapp.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;
    @Autowired
    private UserService userService;
    @Autowired
    private FriendService friendService;

    // Get latest messages received by the logged-in user
    @GetMapping("/received")
    public List<Message> getLatestMessagesForReceiver(Principal principal) {
        String username = principal.getName();
        return messageService.getLatestMessagesForReceiver(username);
    }

    // Send a message to a friend
    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestBody Map<String, String> payload, Principal principal) {
        String senderUsername = principal.getName();
        String receiverUsername = payload.get("receiverUsername");
        String content = payload.get("content");
        Map<String, String> error = new HashMap<>();
        if (receiverUsername == null || content == null || content.trim().isEmpty()) {
            error.put("error", "Receiver and content are required.");
            return ResponseEntity.badRequest().body(error);
        }
        // Check if receiver exists
        if (!userService.userExists(receiverUsername)) {
            error.put("error", "User does not exist.");
            return ResponseEntity.badRequest().body(error);
        }
        // Check if receiver is a friend
        List<String> friends = friendService.getFriendList(senderUsername);
        if (!friends.contains(receiverUsername)) {
            error.put("error", "User is not in your friend list.");
            return ResponseEntity.badRequest().body(error);
        }
        Message message = messageService.sendMessage(senderUsername, receiverUsername, content);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Message sent.");
        return ResponseEntity.ok(response);
    }
} 