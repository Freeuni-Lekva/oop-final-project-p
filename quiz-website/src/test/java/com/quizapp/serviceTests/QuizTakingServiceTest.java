package com.quizapp.serviceTests;

import com.quizapp.model.*;
import com.quizapp.repository.AnswerRepository;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.QuizTakingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuizTakingServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private AnswerRepository answerRepository;

    @InjectMocks
    private QuizTakingService quizTakingService;

    private User user;
    private Quiz quiz;
    private Question question;
    private QuizAttempt attempt;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setPasswordHash("hashed_password");
        user.setRole("ROLE_USER");

        quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        quiz.setQuestions(new ArrayList<>());

        question = new Question("What is 2+2?", Question.QuestionType.MULTIPLE_CHOICE,
                List.of(new Option("4", true)), List.of("4"));
        question.setId(1L);
        question.setQuestionOrder(1);
        quiz.setQuestions(List.of(question));

        attempt = new QuizAttempt(user, quiz);
        attempt.setId(1L);
        attempt.setIsCompleted(false);
    }

    @Test
    void testStartQuiz_NewAttempt() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizAttemptRepository.findByUserIdAndIsCompletedFalse(1L)).thenReturn(List.of());
        when(quizAttemptRepository.save(any(QuizAttempt.class))).thenReturn(attempt);

        QuizAttempt result = quizTakingService.startQuiz(1L, user, false);

        assertNotNull(result);
        assertEquals(user, result.getUser());
        assertEquals(quiz, result.getQuiz());
        assertFalse(result.getIsPracticeMode());
        verify(quizAttemptRepository).save(any(QuizAttempt.class));
    }

    @Test
    void testSubmitQuiz_Success() {
        Map<Long, String> questionAnswers = Map.of(1L, "4");
        when(quizAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(answerRepository.findByQuizAttemptIdOrderByQuestionNumber(1L)).thenReturn(List.of());
        when(answerRepository.saveAll(anyList())).thenReturn(List.of());
        when(quizAttemptRepository.save(any(QuizAttempt.class))).thenReturn(attempt);

        QuizAttempt result = quizTakingService.submitQuiz(1L, questionAnswers);

        assertTrue(result.getIsCompleted());
        assertEquals(1, result.getScore());
        assertEquals(100.0, result.getPercentage());
        verify(answerRepository).saveAll(anyList());
        verify(quizAttemptRepository).save(attempt);
    }

    @Test
    void testGetQuizResults_Success() {
        Answer answer = new Answer(user, attempt, question, "4", true, 1);
        when(quizAttemptRepository.findById(1L)).thenReturn(Optional.of(attempt));
        when(answerRepository.findByQuizAttemptIdOrderByQuestionNumber(1L)).thenReturn(List.of(answer));

        Map<String, Object> result = quizTakingService.getQuizResults(1L);

        assertEquals(attempt, result.get("attempt"));
        assertEquals(List.of(answer), result.get("answers"));
        assertEquals(attempt.getScore(), result.get("score"));
        assertEquals(attempt.getTotalQuestions(), result.get("totalQuestions"));
        assertEquals(attempt.getPercentage(), result.get("percentage"));
    }

    @Test
    void testGetTopScores_Success() {
        QuizAttempt attempt2 = new QuizAttempt(user, quiz);
        attempt2.setScore(8);
        when(quizAttemptRepository.findTopScoresByQuizId(1L)).thenReturn(List.of(attempt, attempt2));

        List<QuizAttempt> result = quizTakingService.getTopScores(1L, 1);

        assertEquals(1, result.size());
        assertEquals(attempt, result.get(0));
        verify(quizAttemptRepository).findTopScoresByQuizId(1L);
    }

}