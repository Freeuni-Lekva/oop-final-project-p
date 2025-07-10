package com.quizapp.controller;

import com.quizapp.dto.FriendRequestDTO;
import com.quizapp.model.FriendRequest;
import com.quizapp.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {
    private final FriendService friendService;
    private static final Logger log = LoggerFactory.getLogger(FriendController.class);

    @PostMapping("/request")
    public ResponseEntity<?> sendFriendRequest(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> payload) {
        String addressee = payload.get("username");
        String result = friendService.sendFriendRequest(userDetails.getUsername(), addressee);
        if (result.equals("Friend request sent.")) {
            return ResponseEntity.ok(Map.of("message", result));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }
    }

    @PostMapping("/accept/{requestId}")
    public ResponseEntity<?> acceptFriendRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long requestId) {
        String result = friendService.acceptFriendRequest(requestId, userDetails.getUsername());
        if (result.equals("Friend request accepted.")) {
            return ResponseEntity.ok(Map.of("message", result));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> getFriendList(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(friendService.getFriendList(userDetails.getUsername()));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendRequestDTO>> getPendingRequests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(friendService.getPendingRequests(userDetails.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<String>> searchUsers(@AuthenticationPrincipal UserDetails userDetails, @RequestParam String username) {
        log.info("Received search request for username: '{}' from user: '{}'", username, userDetails.getUsername());
        try {
            List<String> users = friendService.searchUsers(username, userDetails.getUsername());
            log.info("Found {} users matching the search.", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("Error during user search:", e);
            return ResponseEntity.status(500).build();
        }
    }

    @PostMapping("/reject/{requestId}")
    public ResponseEntity<?> rejectFriendRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable Long requestId) {
        String result = friendService.rejectFriendRequest(requestId, userDetails.getUsername());
        if (result.equals("Friend request rejected.")) {
            return ResponseEntity.ok(Map.of("message", result));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeFriend(@AuthenticationPrincipal UserDetails userDetails, @RequestBody Map<String, String> payload) {
        String friendUsername = payload.get("username");
        String result = friendService.removeFriend(userDetails.getUsername(), friendUsername);
        if (result.equals("Friend removed successfully.")) {
            return ResponseEntity.ok(Map.of("message", result));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", result));
        }
    }
}