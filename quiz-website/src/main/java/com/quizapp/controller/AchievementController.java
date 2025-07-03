package com.quizapp.controller;

import com.quizapp.model.User;
import com.quizapp.model.UserAchievement;
import com.quizapp.service.AchievementService;
import com.quizapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {
    private final AchievementService achievementService;
    private final UserService userService;

    @Autowired
    public AchievementController(AchievementService achievementService, UserService userService) {
        this.achievementService = achievementService;
        this.userService = userService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<UserAchievement>> getUserAchievements(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<UserAchievement> achievements = achievementService.getUserAchievements(user);
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<List<UserAchievement>> getUserAchievementsByUsername(@PathVariable String username) {
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<UserAchievement> achievements = achievementService.getUserAchievements(user);
        return ResponseEntity.ok(achievements);
    }
} 