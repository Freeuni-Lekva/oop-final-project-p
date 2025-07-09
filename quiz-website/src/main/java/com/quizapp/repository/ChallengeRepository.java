package com.quizapp.repository;

import com.quizapp.model.Challenge;
import com.quizapp.model.User;
import com.quizapp.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {
    
    List<Challenge> findByChallengedOrderByCreatedAtDesc(User challenged);
    
    List<Challenge> findByChallengedAndSeenFalseOrderByCreatedAtDesc(User challenged);
    
    @Query("SELECT c FROM Challenge c WHERE c.challenged = :user AND c.seen = false")
    List<Challenge> findUnseenChallengesForUser(@Param("user") User user);
    
    boolean existsByChallengerAndChallengedAndQuiz(User challenger, User challenged, Quiz quiz);
} 