package com.quizapp.controller;

import com.quizapp.model.Quiz;
import com.quizapp.model.User;
import com.quizapp.service.QuizService;
import com.quizapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final UserService userService;

    @PostMapping
    public Quiz createQuiz(@RequestBody Quiz quiz, @AuthenticationPrincipal UserDetails userDetails) {
        if (quiz.getQuestions() == null || quiz.getQuestions().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz must have at least one question");
        }
        if (quiz.getTitle() == null || quiz.getTitle().trim().isEmpty() || quiz.getDescription() == null || quiz.getDescription().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title and description are required");
        }
        User creator = userService.findByUsername(userDetails.getUsername());
        quiz.setCreatedBy(creator);
        quiz.getQuestions().forEach(q -> q.setQuiz(quiz));
        return quizService.createQuiz(quiz);
    }

    @GetMapping("/{id}")
    public Quiz getQuiz(@PathVariable Long id) {
        return quizService.findById(id);
    }
}