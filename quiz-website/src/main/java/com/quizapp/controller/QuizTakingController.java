package com.quizapp.controller;

import com.quizapp.model.*;
import com.quizapp.service.QuizTakingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz-taking")
public class QuizTakingController {

    private final QuizTakingService quizTakingService;

    @Autowired
    public QuizTakingController(QuizTakingService quizTakingService) {
        this.quizTakingService = quizTakingService;
    }

    //start attempt
    @PostMapping("/start/{quizId}")
    public ResponseEntity<Map<String, Object>> startQuiz(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "false") boolean practiceMode,
            @RequestBody User user) {

        try {
            QuizAttempt attempt = quizTakingService.startQuiz(quizId, user, practiceMode);
            List<Question> questions = quizTakingService.getQuizQuestions(quizId, false); // Default to non-randomized

            Map<String, Object> response = new HashMap<>();
            response.put("attemptId", attempt.getId());
            response.put("questions", questions);
            response.put("startTime", attempt.getStartTime());
            response.put("totalQuestions", attempt.getTotalQuestions());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Submit Answers
    @PostMapping("/submit/{attemptId}")
    public ResponseEntity<Map<String, Object>> submitQuiz(
            @PathVariable Long attemptId,
            @RequestBody Map<Long, String> questionAnswers) {

        try {
            QuizAttempt completedAttempt = quizTakingService.submitQuiz(attemptId, questionAnswers);

            Map<String, Object> response = new HashMap<>();
            response.put("attemptId", completedAttempt.getId());
            response.put("score", completedAttempt.getScore());
            response.put("totalQuestions", completedAttempt.getTotalQuestions());
            response.put("percentage", completedAttempt.getPercentage());
            response.put("timeTaken", completedAttempt.getTimeTakenMinutes());
            response.put("completed", completedAttempt.getIsCompleted());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    //get res
    @GetMapping("/results/{attemptId}")
    public ResponseEntity<Map<String, Object>> getQuizResults(@PathVariable Long attemptId) {
        try {
            Map<String, Object> results = quizTakingService.getQuizResults(attemptId);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // TOP scores
    @GetMapping("/top-scores/{quizId}")
    public ResponseEntity<List<QuizAttempt>> getTopScores(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "10") int limit) {

        try {
            List<QuizAttempt> topScores = quizTakingService.getTopScores(quizId, limit);
            return ResponseEntity.ok(topScores);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // History
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<QuizAttempt>> getUserHistory(@PathVariable Long userId) {
        try {
            List<QuizAttempt> history = quizTakingService.getUserHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    //History for one
    @GetMapping("/history/user/{userId}/quiz/{quizId}")
    public ResponseEntity<List<QuizAttempt>> getUserQuizHistory(
            @PathVariable Long userId,
            @PathVariable Long quizId) {

        try {
            List<QuizAttempt> history = quizTakingService.getUserQuizHistory(userId, quizId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/recent/{quizId}")
    public ResponseEntity<List<QuizAttempt>> getRecentAttempts(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "10") int limit) {

        try {
            List<QuizAttempt> recentAttempts = quizTakingService.getRecentAttempts(quizId, limit);
            return ResponseEntity.ok(recentAttempts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/statistics/{quizId}")
    public ResponseEntity<Map<String, Object>> getQuizStatistics(@PathVariable Long quizId) {
        try {
            Map<String, Object> statistics = quizTakingService.getQuizStatistics(quizId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // resume
    @GetMapping("/resume/{attemptId}")
    public ResponseEntity<Map<String, Object>> resumeQuiz(@PathVariable Long attemptId) {
        try {
            QuizAttempt attempt = quizTakingService.resumeQuiz(attemptId);
            List<Question> questions = quizTakingService.getQuizQuestions(attempt.getQuiz().getId(), false);

            Map<String, Object> response = new HashMap<>();
            response.put("attemptId", attempt.getId());
            response.put("questions", questions);
            response.put("startTime", attempt.getStartTime());
            response.put("totalQuestions", attempt.getTotalQuestions());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }


    @GetMapping("/questions/{quizId}")
    public ResponseEntity<List<Question>> getQuizQuestions(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "false") boolean randomize) {

        try {
            List<Question> questions = quizTakingService.getQuizQuestions(quizId, randomize);
            return ResponseEntity.ok(questions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}