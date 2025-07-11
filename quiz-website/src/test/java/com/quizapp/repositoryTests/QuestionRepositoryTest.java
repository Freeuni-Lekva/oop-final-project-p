package com.quizapp.repositoryTests;

import com.quizapp.model.Option;
import com.quizapp.model.Question;
import com.quizapp.model.Quiz;
import com.quizapp.repository.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class QuestionRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private QuestionRepository questionRepository;

    @Test
    void testFindByQuizId() {
        // Arrange
        Quiz quiz1 = new Quiz();
        quiz1.setTitle("Quiz 1");
        entityManager.persist(quiz1);

        Quiz quiz2 = new Quiz();
        quiz2.setTitle("Quiz 2");
        entityManager.persist(quiz2);

        Question question1 = new Question();
        question1.setQuestionText("What is 2+2?");
        question1.setType(Question.QuestionType.MULTIPLE_CHOICE);
        question1.setQuiz(quiz1);
        question1.setOptions(List.of(
                new Option("2", false),
                new Option("4", true),
                new Option("6", false)
        ));
        question1.setCorrectAnswers(List.of("4"));

        Question question2 = new Question();
        question2.setQuestionText("What is the capital of France?");
        question2.setType(Question.QuestionType.QUESTION_RESPONSE);
        question2.setQuiz(quiz1);
        question2.setCorrectAnswers(List.of("France"));

        Question question3 = new Question();
        question3.setQuestionText("What is H2O?");
        question3.setType(Question.QuestionType.QUESTION_RESPONSE);
        question3.setQuiz(quiz2);
        question3.setCorrectAnswers(List.of("Water"));

        entityManager.persist(question1);
        entityManager.persist(question2);
        entityManager.persist(question3);
        entityManager.flush();

        // Act
        List<Question> questions = questionRepository.findByQuizId(quiz1.getId());

        // Assert
        assertEquals(2, questions.size());
        assertTrue(questions.stream().anyMatch(q -> q.getQuestionText().equals("What is 2+2?")));
        assertTrue(questions.stream().anyMatch(q -> q.getQuestionText().equals("What is the capital of France?")));
    }

    @Test
    void testFindByQuizId_NoQuestions() {
        // Act
        List<Question> questions = questionRepository.findByQuizId(999L);

        // Assert
        assertTrue(questions.isEmpty());
    }
}