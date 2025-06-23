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
    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    @Autowired
    public QuizTakingService(QuizRepository quizRepository,
                             QuizAttemptRepository quizAttemptRepository,
                             AnswerRepository answerRepository,
                             QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }


    // new Attempt
    @Transactional
    public QuizAttempt startQuiz(Long quizId, User user, boolean isPracticeMode) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Check if incomplete attempt for this quiz
        List<QuizAttempt> incompleteAttempts = quizAttemptRepository.findByUserIdAndIsCompletedFalse(user.getId());
        for (QuizAttempt attempt : incompleteAttempts) {
            if (attempt.getQuiz().getId().equals(quizId)) {
                return attempt; // incomplete attempt
            }
        }

        // new attempt
        QuizAttempt attempt = new QuizAttempt(user, quiz);
        attempt.setIsPracticeMode(isPracticeMode);

        return quizAttemptRepository.save(attempt);
    }


    // submit
    @Transactional
    public QuizAttempt submitQuiz(Long attemptId, Map<Long, String> questionAnswers) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        if (attempt.getIsCompleted()) {
            throw new RuntimeException("Quiz attempt already completed");
        }

        // Save all answers
        List<Answer> answers = new ArrayList<>();
        for (Map.Entry<Long, String> entry : questionAnswers.entrySet()) {
            Long questionId = entry.getKey();
            String userAnswer = entry.getValue();

            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found"));

            Answer answer = new Answer(question, userAnswer, attempt.getUser(), attempt,
                    question.getQuestionOrder());
            answers.add(answer);
        }

        answerRepository.saveAll(answers);

        // Grade the quiz
        int score = gradeQuiz(answers);
        attempt.completeAttempt(score);

        return quizAttemptRepository.save(attempt);
    }


    //check All Answers
    private int gradeQuiz(List<Answer> answers) {
        int correctCount = 0;

        for (Answer answer : answers) {
            Question question = answer.getQuestion();
            boolean isCorrect = question.isAnswerCorrect(answer.getSelectedAnswer());
            answer.setIsCorrect(isCorrect);

            if (isCorrect) {
                correctCount++;
            }
        }

        return correctCount;
    }


    // Get Results
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
                .mapToDouble(attempt -> attempt.getPercentage())
                .average()
                .orElse(0.0);

        double averageTime = completedAttempts.stream()
                .mapToDouble(attempt -> attempt.getTimeTakenMinutes() != null ? attempt.getTimeTakenMinutes() : 0)
                .average()
                .orElse(0.0);

        int highestScore = completedAttempts.stream()
                .mapToInt(attempt -> attempt.getScore())
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

        List<Question> questions = new ArrayList<>(quiz.getQuestions());

        if (randomize) {
            Collections.shuffle(questions);
        } else {
            questions.sort(Comparator.comparing(Question::getQuestionOrder, Comparator.nullsLast(Comparator.naturalOrder())));
        }

        return questions;
    }
}