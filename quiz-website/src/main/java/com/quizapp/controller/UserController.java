package com.quizapp.controller;

import com.quizapp.dto.QuizHistoryItemDTO;
import com.quizapp.dto.UserProfileDTO;
import com.quizapp.model.User;
import com.quizapp.service.FriendService;
import com.quizapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private FriendService friendService;

    @GetMapping("/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser"))
                ? auth.getName() : null;
        User requestedUser = userService.findByUsername(username);
        if (requestedUser == null) {
            return ResponseEntity.notFound().build();
        }
        String friendStatus = "NONE";
        if (currentUsername != null && !currentUsername.equals(username)) {
            friendStatus = friendService.getFriendStatus(currentUsername, username); // FRIENDS, PENDING, NONE
        } else if (currentUsername != null && currentUsername.equals(username)) {
            friendStatus = "SELF";
        }
        UserProfileDTO dto = new UserProfileDTO(requestedUser.getId(), requestedUser.getUsername(), friendStatus, currentUsername);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{username}/quiz-history")
    public ResponseEntity<List<QuizHistoryItemDTO>> getQuizHistory(@PathVariable String username) {
        List<QuizHistoryItemDTO> history = userService.getQuizHistoryForUser(username);
        return ResponseEntity.ok(history);
    }
} 