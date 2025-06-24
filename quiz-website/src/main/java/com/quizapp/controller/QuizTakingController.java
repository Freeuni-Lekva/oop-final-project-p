package com.quizapp.controller;

import com.quizapp.model.*;
import com.quizapp.service.QuizTakingService;
import com.quizapp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quiz-taking")
public class QuizTakingController {

    private final QuizTakingService quizTakingService;
    private final UserService userService;

    @Autowired
    public QuizTakingController(QuizTakingService quizTakingService, UserService userService) {
        this.quizTakingService = quizTakingService;
        this.userService = userService;
    }

    // Start attempt
    @PostMapping("/start/{quizId}")
    public ResponseEntity<Map<String, Object>> startQuiz(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "false") boolean practiceMode,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.findByUsername(userDetails.getUsername());
            QuizAttempt attempt = quizTakingService.startQuiz(quizId, user, practiceMode);
            List<Question> questions = quizTakingService.getQuizQuestions(quizId, false);
            List<QuestionDto> questionDtos = questions.stream().map(QuestionDto::new).collect(Collectors.toList());
            Map<String, Object> response = new HashMap<>();
            response.put("attemptId", attempt.getId());
            response.put("questions", questionDtos);
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

    // Get results
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

    // Top scores
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

    // History for one quiz
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

    // Resume
    @GetMapping("/resume/{attemptId}")
    public ResponseEntity<Map<String, Object>> resumeQuiz(@PathVariable Long attemptId) {
        try {
            QuizAttempt attempt = quizTakingService.resumeQuiz(attemptId);
            List<Question> questions = quizTakingService.getQuizQuestions(attempt.getQuiz().getId(), false);
            List<QuestionDto> questionDtos = questions.stream().map(QuestionDto::new).collect(Collectors.toList());
            Map<String, Object> response = new HashMap<>();
            response.put("attemptId", attempt.getId());
            response.put("questions", questionDtos);
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
    public ResponseEntity<List<QuestionDto>> getQuizQuestions(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "false") boolean randomize) {
        try {
            List<Question> questions = quizTakingService.getQuizQuestions(quizId, randomize);
            List<QuestionDto> questionDtos = questions.stream().map(QuestionDto::new).collect(Collectors.toList());
            return ResponseEntity.ok(questionDtos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/check/{attemptId}/{questionId}")
    public ResponseEntity<Map<String, Object>> checkAnswer(
            @PathVariable Long attemptId,
            @PathVariable Long questionId,
            @RequestBody Map<String, String> body) {
        String userAnswer = body.get("answer");
        try {
            boolean correct = quizTakingService.checkSingleAnswer(attemptId, questionId, userAnswer);
            Map<String, Object> response = new HashMap<>();
            response.put("correct", correct);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    public static class QuestionDto {
        public Long id;
        public String questionText;
        public String type;
        public String imageUrl;
        public Integer questionOrder;
        public List<OptionDto> options;
        public List<String> correctAnswers;
        public Boolean orderMatters;

        public QuestionDto(Question question) {
            this.id = question.getId();
            this.questionText = question.getQuestionText();
            this.type = question.getType() != null ? question.getType().name() : null;
            this.imageUrl = question.getImageUrl();
            this.questionOrder = question.getQuestionOrder();
            this.options = question.getOptions() != null ? 
                question.getOptions().stream().map(OptionDto::new).collect(Collectors.toList()) : 
                List.of();
            this.correctAnswers = question.getCorrectAnswers();
            this.orderMatters = question.getOrderMatters();
        }
    }

    public static class OptionDto {
        public Long id;
        public String text;
        public boolean isCorrect;

        public OptionDto(Option option) {
            this.id = option.getId();
            this.text = option.getText();
            this.isCorrect = option.getIsCorrect();
        }
    }
}