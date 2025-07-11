package com.quizapp.controller;

import com.quizapp.model.Quiz;
import com.quizapp.model.User;
import com.quizapp.service.QuizService;
import com.quizapp.service.UserService;
import com.quizapp.util.SecurityUtils;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.AnswerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final UserService userService;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AnswerRepository answerRepository;

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
    public QuizDto getQuiz(@PathVariable Long id) {
        Quiz quiz = quizService.findById(id);
        return new QuizDto(quiz);
    }

    @GetMapping
    public List<QuizSummaryDto> getAllQuizzes() {
        return quizService.getAllQuizzes().stream()
                .map(quiz -> new QuizSummaryDto(
                        quiz.getId(),
                        quiz.getTitle(),
                        quiz.getDescription(),
                        quiz.getCreatedBy() != null ? quiz.getCreatedBy().getUsername() : null
                ))
                .toList();
    }

    @DeleteMapping("/{id}")
    public void deleteQuiz(@PathVariable Long id, Authentication authentication) {
        if (!SecurityUtils.isAdmin(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can delete quizzes");
        }
        // Delete all quiz attempts and answers for this quiz
        var attempts = quizAttemptRepository.findByQuizIdOrderByScoreDescTimeTakenMinutesAsc(id);
        for (var attempt : attempts) {
            answerRepository.deleteAll(answerRepository.findByQuizAttemptIdOrderByQuestionNumber(attempt.getId()));
            quizAttemptRepository.delete(attempt);
        }
        // Delete the quiz itself (questions/options cascade)
        quizService.deleteQuiz(id);
    }

    public static class QuizSummaryDto {
        public Long id;
        public String title;
        public String description;
        public String createdBy;
        public QuizSummaryDto(Long id, String title, String description, String createdBy) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.createdBy = createdBy;
        }
    }

    public static class QuizDto {
        public Long id;
        public String title;
        public String description;
        public String createdBy;
        public List<QuestionDto> questions;
        public boolean randomizeQuestions;
        public boolean singlePage;
        public boolean immediateCorrection;
        public boolean practiceMode;

        public QuizDto(Quiz quiz) {
            this.id = quiz.getId();
            this.title = quiz.getTitle();
            this.description = quiz.getDescription();
            this.createdBy = quiz.getCreatedBy() != null ? quiz.getCreatedBy().getUsername() : null;
            this.questions = quiz.getQuestions() != null ?
                    quiz.getQuestions().stream().map(QuestionDto::new).collect(Collectors.toList()) :
                    List.of();
            this.randomizeQuestions = quiz.isRandomizeQuestions();
            this.singlePage = quiz.isSinglePage();
            this.immediateCorrection = quiz.isImmediateCorrection();
            this.practiceMode = quiz.isPracticeMode();
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

        public QuestionDto(com.quizapp.model.Question question) {
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

        public OptionDto(com.quizapp.model.Option option) {
            this.id = option.getId();
            this.text = option.getText();
            this.isCorrect = option.getIsCorrect();
        }
    }
}