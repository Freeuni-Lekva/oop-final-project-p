package com.quizapp.repositoryTests;

import com.quizapp.model.Quiz;
import com.quizapp.model.QuizAttempt;
import com.quizapp.model.User;
import com.quizapp.repository.QuizAttemptRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
public class QuizAttemptRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Test
    void testFindByUserIdOrderByStartTimeDesc() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("hashed_password");
        user.setRole("ROLE_USER");
        entityManager.persist(user);

        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setQuestions(new ArrayList<>()); // Initialize questions to avoid NPE
        entityManager.persist(quiz);

        QuizAttempt attempt1 = new QuizAttempt(user, quiz);
        attempt1.setStartTime(LocalDateTime.now().minusHours(2));
        attempt1.completeAttempt(5);

        QuizAttempt attempt2 = new QuizAttempt(user, quiz);
        attempt2.setStartTime(LocalDateTime.now().minusHours(1));
        attempt2.completeAttempt(8);

        entityManager.persist(attempt1);
        entityManager.persist(attempt2);
        entityManager.flush();

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdOrderByStartTimeDesc(user.getId());

        assertEquals(2, attempts.size());
        assertEquals(8, attempts.get(0).getScore());
        assertEquals(5, attempts.get(1).getScore());
    }

    @Test
    void testFindByUserIdAndQuizIdOrderByStartTimeDesc() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("hashed_password");
        user.setRole("ROLE_USER");
        entityManager.persist(user);

        Quiz quiz1 = new Quiz();
        quiz1.setTitle("Quiz 1");
        quiz1.setQuestions(new ArrayList<>()); // Initialize questions to avoid NPE
        entityManager.persist(quiz1);

        Quiz quiz2 = new Quiz();
        quiz2.setTitle("Quiz 2");
        quiz2.setQuestions(new ArrayList<>()); // Initialize questions to avoid NPE
        entityManager.persist(quiz2);

        QuizAttempt attempt1 = new QuizAttempt(user, quiz1);
        attempt1.setStartTime(LocalDateTime.now().minusHours(2));
        attempt1.completeAttempt(5);

        QuizAttempt attempt2 = new QuizAttempt(user, quiz1);
        attempt2.setStartTime(LocalDateTime.now().minusHours(1));
        attempt2.completeAttempt(8);

        entityManager.persist(attempt1);
        entityManager.persist(attempt2);
        entityManager.flush();

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndQuizIdOrderByStartTimeDesc(user.getId(), quiz1.getId());

        assertEquals(2, attempts.size());
        assertEquals(8, attempts.get(0).getScore());
        assertEquals(5, attempts.get(1).getScore());
    }

    @Test
    void testFindByUserIdAndIsCompletedTrueOrderByStartTimeDesc() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("hashed_password");
        user.setRole("ROLE_USER");
        entityManager.persist(user);

        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setQuestions(new ArrayList<>()); // Initialize questions to avoid NPE
        entityManager.persist(quiz);

        QuizAttempt attempt1 = new QuizAttempt(user, quiz);
        attempt1.setStartTime(LocalDateTime.now().minusHours(2));
        attempt1.completeAttempt(5);

        QuizAttempt attempt2 = new QuizAttempt(user, quiz);
        attempt2.setStartTime(LocalDateTime.now().minusHours(1));
        attempt2.setIsCompleted(false);

        entityManager.persist(attempt1);
        entityManager.persist(attempt2);
        entityManager.flush();

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndIsCompletedTrueOrderByStartTimeDesc(user.getId());

        assertEquals(1, attempts.size());
        assertEquals(5, attempts.get(0).getScore());
    }

    @Test
    void testFindTopScoresByQuizId() {
        User user1 = new User();
        user1.setUsername("user1");
        user1.setPasswordHash("hashed_password");
        user1.setRole("ROLE_USER");
        entityManager.persist(user1);

        User user2 = new User();
        user2.setUsername("user2");
        user2.setPasswordHash("hashed_password");
        user2.setRole("ROLE_USER");
        entityManager.persist(user2);

        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setQuestions(new ArrayList<>()); // Initialize questions to avoid NPE
        entityManager.persist(quiz);

        QuizAttempt attempt1 = new QuizAttempt(user1, quiz);
        attempt1.setStartTime(LocalDateTime.now().minusMinutes(10));
        attempt1.setEndTime(LocalDateTime.now());
        attempt1.completeAttempt(5);

        QuizAttempt attempt2 = new QuizAttempt(user2, quiz);
        attempt2.setStartTime(LocalDateTime.now().minusMinutes(5));
        attempt2.setEndTime(LocalDateTime.now());
        attempt2.completeAttempt(8);

        entityManager.persist(attempt1);
        entityManager.persist(attempt2);
        entityManager.flush();

        List<QuizAttempt> attempts = quizAttemptRepository.findTopScoresByQuizId(quiz.getId());

        assertEquals(2, attempts.size());
        assertEquals(8, attempts.get(0).getScore());
        assertEquals(5, attempts.get(1).getScore());
    }


    @Test
    void testFindBestScoreByUserAndQuiz() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("hashed_password");
        user.setRole("ROLE_USER");
        entityManager.persist(user);

        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setQuestions(new ArrayList<>()); // Initialize questions to avoid NPE
        entityManager.persist(quiz);

        QuizAttempt attempt1 = new QuizAttempt(user, quiz);
        attempt1.setStartTime(LocalDateTime.now().minusMinutes(10));
        attempt1.setEndTime(LocalDateTime.now());
        attempt1.completeAttempt(5);

        QuizAttempt attempt2 = new QuizAttempt(user, quiz);
        attempt2.setStartTime(LocalDateTime.now().minusMinutes(5));
        attempt2.setEndTime(LocalDateTime.now());
        attempt2.completeAttempt(8);

        entityManager.persist(attempt1);
        entityManager.persist(attempt2);
        entityManager.flush();

        List<QuizAttempt> attempts = quizAttemptRepository.findBestScoreByUserAndQuiz(user.getId(), quiz.getId());

        assertEquals(2, attempts.size());
        assertEquals(8, attempts.get(0).getScore());
        assertEquals(5, attempts.get(1).getScore());
    }

    @Test
    void testFindByUserIdAndIsCompletedFalse() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("hashed_password");
        user.setRole("ROLE_USER");
        entityManager.persist(user);

        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setQuestions(new ArrayList<>()); // Initialize questions to avoid NPE
        entityManager.persist(quiz);

        QuizAttempt attempt1 = new QuizAttempt(user, quiz);
        attempt1.setStartTime(LocalDateTime.now());
        attempt1.setIsCompleted(false);

        QuizAttempt attempt2 = new QuizAttempt(user, quiz);
        attempt2.setStartTime(LocalDateTime.now());
        attempt2.completeAttempt(5);

        entityManager.persist(attempt1);
        entityManager.persist(attempt2);
        entityManager.flush();

        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndIsCompletedFalse(user.getId());

        assertEquals(1, attempts.size());
        assertFalse(attempts.get(0).getIsCompleted());
    }

    @Test
    void testFindByUserIdOrderByStartTimeDesc_NoAttempts() {
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdOrderByStartTimeDesc(999L);
        assertTrue(attempts.isEmpty());
    }
}