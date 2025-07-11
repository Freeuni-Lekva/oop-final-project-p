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
    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.user WHERE qa.user.id = :userId AND qa.quiz.id = :quizId ORDER BY qa.startTime DESC")
    List<QuizAttempt> findByUserIdAndQuizIdOrderByStartTimeDesc(@Param("userId") Long userId, @Param("quizId") Long quizId);

    // Find completed attempts by user
    List<QuizAttempt> findByUserIdAndIsCompletedTrueOrderByStartTimeDesc(Long userId);

    // Find top scores for a quiz
    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.user WHERE qa.quiz.id = :quizId AND qa.isCompleted = true AND qa.isPracticeMode = false ORDER BY qa.score DESC, qa.endTime - qa.startTime ASC")
    List<QuizAttempt> findTopScoresByQuizId(@Param("quizId") Long quizId);

    // Find top scores for a quiz in the last day
    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.user WHERE qa.quiz.id = :quizId AND qa.isCompleted = true AND qa.isPracticeMode = false AND qa.endTime >= CURRENT_DATE ORDER BY qa.score DESC, qa.endTime - qa.startTime ASC")
    List<QuizAttempt> findTopScoresTodayByQuizId(@Param("quizId") Long quizId);

    // Find recent attempts for a quiz
    @Query("SELECT qa FROM QuizAttempt qa JOIN FETCH qa.user WHERE qa.quiz.id = :quizId AND qa.isCompleted = true ORDER BY qa.endTime DESC")
    List<QuizAttempt> findRecentAttemptsByQuizId(@Param("quizId") Long quizId);

    // Find best score for a user on a specific quiz
    @Query("SELECT qa FROM QuizAttempt qa WHERE qa.user.id = :userId AND qa.quiz.id = :quizId AND qa.isCompleted = true AND qa.isPracticeMode = false ORDER BY qa.score DESC, qa.endTime - qa.startTime ASC")
    List<QuizAttempt> findBestScoreByUserAndQuiz(@Param("userId") Long userId, @Param("quizId") Long quizId);

    // Find incomplete attempts for resuming quizzes
    List<QuizAttempt> findByUserIdAndIsCompletedFalse(Long userId);

    // Find top N most taken quizzes (by number of completed, non-practice attempts)
    @Query("SELECT qa.quiz.id, COUNT(qa.id) as attemptCount FROM QuizAttempt qa WHERE qa.isCompleted = true AND qa.isPracticeMode = false GROUP BY qa.quiz.id ORDER BY attemptCount DESC")
    List<Object[]> findTopMostTakenQuizzes(org.springframework.data.domain.Pageable pageable);

    long countByQuizId(Long quizId);
    long countByQuizIdAndIsCompletedTrueAndIsPracticeModeFalse(Long quizId);
}