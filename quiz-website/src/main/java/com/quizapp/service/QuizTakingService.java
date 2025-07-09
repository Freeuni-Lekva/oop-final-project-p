package com.quizapp.service;

import com.quizapp.model.*;
import com.quizapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class QuizTakingService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;

    @Autowired
    public QuizTakingService(QuizRepository quizRepository,
                             QuizAttemptRepository quizAttemptRepository,
                             QuestionRepository questionRepository,
                             AnswerRepository answerRepository) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
    }

    // Start a new attempt
    @Transactional
    public QuizAttempt startQuiz(Long quizId, User user, boolean isPracticeMode) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Check for incomplete attempt
        List<QuizAttempt> incompleteAttempts = quizAttemptRepository.findByUserIdAndIsCompletedFalse(user.getId());
        for (QuizAttempt attempt : incompleteAttempts) {
            if (attempt.getQuiz().getId().equals(quizId)) {
                return attempt;
            }
        }

        QuizAttempt attempt = new QuizAttempt(user, quiz);
        attempt.setIsPracticeMode(isPracticeMode);
        return quizAttemptRepository.save(attempt);
    }

    // Submit answers and grade
    @Transactional
    public QuizAttempt submitQuiz(Long attemptId, Map<Long, String> questionAnswers) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getIsCompleted()) {
            throw new RuntimeException("Quiz attempt already completed");
        }

        // Remove previous answers for this attempt (if any)
        List<Answer> oldAnswers = answerRepository.findByQuizAttemptIdOrderByQuestionNumber(attemptId);
        if (!oldAnswers.isEmpty()) {
            answerRepository.deleteAll(oldAnswers);
        }

        // Save new answers and grade
        int correctCount = 0;
        Quiz quiz = attempt.getQuiz();
        List<Question> questions = quiz.getQuestions();
        List<Answer> answers = new ArrayList<>();
        for (Question q : questions) {
            String userAnswer = questionAnswers.get(q.getId());
            boolean isCorrect = userAnswer != null && q.isAnswerCorrect(userAnswer);
            if (isCorrect) correctCount++;
            Answer answer = new Answer(
                attempt.getUser(),
                attempt,
                q,
                userAnswer,
                isCorrect,
                q.getQuestionOrder()
            );
            answers.add(answer);
        }
        answerRepository.saveAll(answers);
        attempt.completeAttempt(correctCount);
        QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
        return savedAttempt;
    }

    // Get results
    public Map<String, Object> getQuizResults(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));
        List<Answer> answers = answerRepository.findByQuizAttemptIdOrderByQuestionNumber(attemptId);
        Map<String, Object> results = new HashMap<>();
        results.put("attempt", attempt);
        results.put("answers", answers);
        results.put("score", attempt.getScore());
        results.put("totalQuestions", attempt.getTotalQuestions());
        results.put("percentage", attempt.getPercentage());
        results.put("timeTaken", attempt.getTimeTakenMinutes());
        return results;
    }

    public List<QuizAttempt> getTopScores(Long quizId, int limit) {
        List<QuizAttempt> topScores = quizAttemptRepository.findTopScoresByQuizId(quizId);
        return topScores.stream().limit(limit).collect(Collectors.toList());
    }

    public List<QuizAttempt> getUserQuizHistory(Long userId, Long quizId) {
        return quizAttemptRepository.findByUserIdAndQuizIdOrderByStartTimeDesc(userId, quizId);
    }

    public List<QuizAttempt> getUserHistory(Long userId) {
        return quizAttemptRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    public List<QuizAttempt> getRecentAttempts(Long quizId, int limit) {
        List<QuizAttempt> recentAttempts = quizAttemptRepository.findRecentAttemptsByQuizId(quizId);
        return recentAttempts.stream().limit(limit).collect(Collectors.toList());
    }

    public Map<String, Object> getQuizStatistics(Long quizId) {
        List<QuizAttempt> allAttempts = quizAttemptRepository.findByQuizIdOrderByScoreDescTimeTakenMinutesAsc(quizId);
        List<QuizAttempt> completedAttempts = allAttempts.stream()
                .filter(QuizAttempt::getIsCompleted)
                .filter(attempt -> !attempt.getIsPracticeMode())
                .collect(Collectors.toList());

        if (completedAttempts.isEmpty()) {
            return Map.of(
                    "totalAttempts", 0,
                    "averageScore", 0.0,
                    "averageTime", 0.0,
                    "highestScore", 0
            );
        }

        double averageScore = completedAttempts.stream()
                .mapToDouble(QuizAttempt::getPercentage)
                .average()
                .orElse(0.0);

        double averageTime = completedAttempts.stream()
                .mapToDouble(attempt -> attempt.getTimeTakenMinutes() != null ? attempt.getTimeTakenMinutes() : 0)
                .average()
                .orElse(0.0);

        int highestScore = completedAttempts.stream()
                .mapToInt(QuizAttempt::getScore)
                .max()
                .orElse(0);

        return Map.of(
                "totalAttempts", completedAttempts.size(),
                "averageScore", Math.round(averageScore * 100.0) / 100.0,
                "averageTime", Math.round(averageTime * 100.0) / 100.0,
                "highestScore", highestScore
        );
    }

    public QuizAttempt resumeQuiz(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getIsCompleted()) {
            throw new RuntimeException("Cannot resume completed quiz");
        }

        return attempt;
    }

    public List<Question> getQuizQuestions(Long quizId, boolean randomize) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
        List<Question> questions = quiz.getQuestions();
        if (randomize) {
            List<Question> shuffled = new ArrayList<>(questions);
            Collections.shuffle(shuffled);
            return shuffled;
        }
        return questions;
    }

    public boolean checkSingleAnswer(Long attemptId, Long questionId, String userAnswer) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found"));
        return question.isAnswerCorrect(userAnswer);
    }
}