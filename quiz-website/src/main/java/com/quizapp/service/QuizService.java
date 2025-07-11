package com.quizapp.service;

import com.quizapp.model.Quiz;
import com.quizapp.repository.QuizRepository;
import com.quizapp.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import java.util.Map;
import java.util.HashMap;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;

    @Transactional
    public Quiz createQuiz(Quiz quiz) {
        if (quiz.getQuestions() != null) {
            quiz.getQuestions().forEach(q -> q.setQuiz(quiz));
        }
        Quiz savedQuiz = quizRepository.save(quiz);
        return savedQuiz;
    }

    public Quiz findById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }
    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }

    // Get top N most taken quizzes (by number of completed, non-practice attempts)
    public List<Map<String, Object>> getTopMostTakenQuizzes(int n, com.quizapp.repository.QuizAttemptRepository quizAttemptRepository) {
        var results = quizAttemptRepository.findTopMostTakenQuizzes(PageRequest.of(0, n));
        List<Long> quizIds = new java.util.ArrayList<>();
        Map<Long, Long> attemptCounts = new HashMap<>();
        for (Object[] row : results) {
            Long quizId = ((Number) row[0]).longValue();
            Long count = ((Number) row[1]).longValue();
            quizIds.add(quizId);
            attemptCounts.put(quizId, count);
        }
        List<Quiz> quizzes = quizRepository.findByIdIn(quizIds);
        // Preserve order and attach attempt counts
        List<Map<String, Object>> popular = new java.util.ArrayList<>();
        for (Long id : quizIds) {
            Quiz quiz = quizzes.stream().filter(q -> q.getId().equals(id)).findFirst().orElse(null);
            if (quiz != null) {
                Map<String, Object> map = new HashMap<>();
                map.put("quiz", quiz);
                map.put("attemptCount", attemptCounts.get(id));
                popular.add(map);
            }
        }
        return popular;
    }
}