package com.quizapp.repository;

import com.quizapp.model.Quiz;
import com.quizapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    long countByCreatedBy(User user);
    // Fetch quizzes by a list of IDs
    java.util.List<Quiz> findByIdIn(java.util.List<Long> ids);
    java.util.List<Quiz> findByCreatedBy(User user);
}