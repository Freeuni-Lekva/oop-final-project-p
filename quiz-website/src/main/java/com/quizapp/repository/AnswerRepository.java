package com.quizapp.repository;

import com.quizapp.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    //all answers for a single attempt
    List<Answer> findByQuizAttemptIdOrderByQuestionNumber(Long quizAttemptId);

    //answers by user
    List<Answer> findByUserIdOrderByQuizAttemptIdAscQuestionNumberAsc(Long userId);

    // Find answers for a question in a quiz attempt
    Answer findByQuizAttemptIdAndQuestionId(Long quizAttemptId, Long questionId);

    // Find correct answers for a quiz attempt
    List<Answer> findByQuizAttemptIdAndIsCorrectTrue(Long quizAttemptId);

    // Find answers by user and quiz
    @Query("SELECT a FROM Answer a WHERE a.user.id = :userId AND a.quizAttempt.quiz.id = :quizId ORDER BY a.quizAttempt.startTime DESC, a.questionNumber ASC")
    List<Answer> findByUserIdAndQuizId(@Param("userId") Long userId, @Param("quizId") Long quizId);

    // Count correct answers for an attempt
    @Query("SELECT COUNT(a) FROM Answer a WHERE a.quizAttempt.id = :quizAttemptId AND a.isCorrect = true")
    Long countCorrectAnswersByQuizAttemptId(@Param("quizAttemptId") Long quizAttemptId);
}