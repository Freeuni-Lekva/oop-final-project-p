package com.quizapp.repository;

import com.quizapp.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findByUserId(String userId);

}
