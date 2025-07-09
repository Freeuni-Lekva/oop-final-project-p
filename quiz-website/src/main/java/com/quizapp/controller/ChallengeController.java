package com.quizapp.controller;

import com.quizapp.model.Challenge;
import com.quizapp.service.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/challenges")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ChallengeController {

    @Autowired
    private ChallengeService challengeService;

    @PostMapping("/send")
    public ResponseEntity<?> sendChallenge(@RequestBody Map<String, String> request) {
        try {
            String challengerUsername = request.get("challengerUsername");
            String challengedUsername = request.get("challengedUsername");
            Long quizId = Long.parseLong(request.get("quizId"));
            
            Challenge challenge = challengeService.sendChallenge(challengerUsername, challengedUsername, quizId);
            return ResponseEntity.ok(challenge);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error sending challenge: " + e.getMessage());
        }
    }

    @GetMapping("/for-user/{username}")
    public ResponseEntity<List<Challenge>> getChallengesForUser(@PathVariable String username) {
        try {
            List<Challenge> challenges = challengeService.getChallengesForUser(username);
            return ResponseEntity.ok(challenges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/unseen/{username}")
    public ResponseEntity<List<Challenge>> getUnseenChallengesForUser(@PathVariable String username) {
        try {
            List<Challenge> challenges = challengeService.getUnseenChallengesForUser(username);
            return ResponseEntity.ok(challenges);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{challengeId}/mark-seen")
    public ResponseEntity<?> markChallengeAsSeen(@PathVariable Long challengeId) {
        try {
            challengeService.markChallengeAsSeen(challengeId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error marking challenge as seen: " + e.getMessage());
        }
    }

    @GetMapping("/challenger-best-score/{quizId}/{challengerUsername}")
    public ResponseEntity<Integer> getChallengerBestScore(@PathVariable Long quizId, @PathVariable String challengerUsername) {
        try {
            Integer score = challengeService.getChallengerBestScore(quizId, challengerUsername);
            return ResponseEntity.ok(score);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
} 