package com.quizapp.controller;

import com.quizapp.model.Answer;
import com.quizapp.model.Question;
import com.quizapp.model.Quiz;
import com.quizapp.repository.AnswerRepository;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController // Marks this class as a REST Controller
@RequestMapping("/api/quizzes")
public class QuizController {
    private final QuizService quizService;

    // Constructor injection for QuizService
    @Autowired
    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    // Endpoint to get all quizzes
    // Handles GET requests to /api/quizzes
    @GetMapping
    public ResponseEntity<List<Quiz>> getAllQuizzes() {
        List<Quiz> quizzes = quizService.getAllQuizzes();
        return new ResponseEntity<>(quizzes, HttpStatus.OK); // Returns 200 OK with the list of quizzes
    }

    // Endpoint to get a single quiz by ID
    // Handles GET requests to /api/quizzes/{id} (e.g., /api/quizzes/1)
    @GetMapping("/{id}")
    public ResponseEntity<Quiz> getQuizById(@PathVariable Long id) {
        Optional<Quiz> quiz = quizService.getQuizById(id);
        return quiz.map(value -> new ResponseEntity<>(value, HttpStatus.OK)) // Returns 200 OK if found
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND)); // Returns 404 Not Found if not found
    }

    // Endpoint to create a new quiz
    // Handles POST requests to /api/quizzes
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz) {
        Quiz createdQuiz = quizService.createQuiz(quiz);
        return new ResponseEntity<>(createdQuiz, HttpStatus.CREATED); // Returns 201 Created with the new quiz
    }

    // Endpoint to update an existing quiz
    // Handles PUT requests to /api/quizzes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long id, @RequestBody Quiz quiz) {
        Optional<Quiz> updatedQuiz = quizService.updateQuiz(id, quiz);
        return updatedQuiz.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint to delete a quiz
    // Handles DELETE requests to /api/quizzes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Returns 204 No Content
    }
}
