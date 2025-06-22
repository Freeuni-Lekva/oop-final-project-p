package com.quizapp.repository;

import com.quizapp.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    // Find all attempts by a user
    List<QuizAttempt> findByUserIdOrderByStartTimeDesc(Long userId);

    // Find all attempts for a quiz
    List<QuizAttempt> findByQuizIdOrderByScoreDescTimeTakenMinutesAsc(Long quizId);

    // Find attempts by user and quiz
    List<QuizAttempt> findByUserIdAndQuizIdOrderByStartTimeDesc(Long userId, Long quizId);

    // Find completed attempts by user
    List<QuizAttempt> findByUserIdAndIsCompletedTrueOrderByStartTimeDesc(Long userId);

    // Find top scores for a quiz
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.isCompleted = true AND qa.isPracticeMode = false ORDER BY qa.score DESC, qa.endTime - qa.startTime ASC")
    List<QuizAttempt> findTopScoresByQuizId(@Param("quizId") Long quizId);

    // Find recent attempts for a quiz
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.quiz.id = :quizId AND qa.isCompleted = true ORDER BY qa.endTime DESC")
    List<QuizAttempt> findRecentAttemptsByQuizId(@Param("quizId") Long quizId);

    // Find best score for a user on a specific quiz
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.user.id = :userId AND qa.quiz.id = :quizId AND qa.isCompleted = true AND qa.isPracticeMode = false ORDER BY qa.score DESC, qa.endTime - qa.startTime ASC")
    List<QuizAttempt> findBestScoreByUserAndQuiz(@Param("userId") Long userId, @Param("quizId") Long quizId);

    // Find incomplete attempts for resuming quizzes
    List<QuizAttempt> findByUserIdAndIsCompletedFalse(Long userId);
}