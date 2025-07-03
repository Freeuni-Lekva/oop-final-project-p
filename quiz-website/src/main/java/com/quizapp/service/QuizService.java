package com.quizapp.service;

import com.quizapp.model.Quiz;
import com.quizapp.repository.QuizRepository;
import com.quizapp.model.User;
import com.quizapp.service.AchievementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final AchievementService achievementService;

    @Transactional
    public Quiz createQuiz(Quiz quiz) {
        if (quiz.getQuestions() != null) {
            quiz.getQuestions().forEach(q -> q.setQuiz(quiz));
        }
        Quiz savedQuiz = quizRepository.save(quiz);
        // Award achievements
        User creator = savedQuiz.getCreatedBy();
        if (creator != null) {
            long quizCount = quizRepository.countByCreatedBy(creator);
            achievementService.checkAuthorAchievements(creator, quizCount);
        }
        return savedQuiz;
    }

    public Quiz findById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }
}