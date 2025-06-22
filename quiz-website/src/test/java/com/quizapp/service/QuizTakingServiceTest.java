package com.quizapp.service;

import com.quizapp.model.*;
import com.quizapp.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizTakingServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private AnswerRepository answerRepository;

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuizTakingService quizTakingService;

    private User testUser;
    private Quiz testQuiz;
    private List<Question> testQuestions;
    private QuizAttempt testAttempt;

    @BeforeEach
    void setUp() {
        // Create test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");

        // Create test quiz
        testQuiz = new Quiz();
        testQuiz.setId(1L);
        testQuiz.setTitle("Test Quiz");
        testQuiz.setDescription("A test quiz");

        // Create test questions
        testQuestions = new ArrayList<>();

        Question question1 = new Question();
        question1.setId(1L);
        question1.setQuestionText("What is 2 + 2?");
        question1.setType("question-response");
        question1.setCorrectAnswers(Arrays.asList("4", "four"));
        question1.setQuestionOrder(1);
        question1.setQuiz(testQuiz);

        Question question2 = new Question();
        question2.setId(2L);
        question2.setQuestionText("What is the capital of France?");
        question2.setType("multiple-choice");
        question2.setChoices(Arrays.asList("London", "Paris", "Berlin", "Madrid"));
        question2.setCorrectAnswers(Arrays.asList("Paris"));
        question2.setQuestionOrder(2);
        question2.setQuiz(testQuiz);

        testQuestions.add(question1);
        testQuestions.add(question2);
        testQuiz.setQuestions(testQuestions);

        // Create test attempt
        testAttempt = new QuizAttempt(testUser, testQuiz);
        testAttempt.setId(1L);
        testAttempt.setIsCompleted(false);
    }

    @Test
    void testStartQuiz() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(testQuiz));
        when(quizAttemptRepository.findByUserIdAndIsCompletedFalse(1L)).thenReturn(new ArrayList<>());
        when(quizAttemptRepository.save(any(QuizAttempt.class))).thenReturn(testAttempt);

        QuizAttempt result = quizTakingService.startQuiz(1L, testUser, false);

        assertNotNull(result);
        assertEquals(testUser, result.getUser());
        assertEquals(testQuiz, result.getQuiz());
        assertFalse(result.getIsCompleted());
        verify(quizAttemptRepository).save(any(QuizAttempt.class));
    }

    @Test
    void testStartQuizWithExistingIncompleteAttempt() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(testQuiz));
        when(quizAttemptRepository.findByUserIdAndIsCompletedFalse(1L))
                .thenReturn(Arrays.asList(testAttempt));

        QuizAttempt result = quizTakingService.startQuiz(1L, testUser, false);

        assertNotNull(result);
        assertEquals(testAttempt, result);
        verify(quizAttemptRepository, never()).save(any(QuizAttempt.class));
    }

    @Test
    void testSubmitQuiz() {
        //
        Map<Long, String> questionAnswers = new HashMap<>();
        questionAnswers.put(1L, "4");
        questionAnswers.put(2L, "Paris");

        when(quizAttemptRepository.findById(1L)).thenReturn(Optional.of(testAttempt));
        when(questionRepository.findById(1L)).thenReturn(Optional.of(testQuestions.get(0)));
        when(questionRepository.findById(2L)).thenReturn(Optional.of(testQuestions.get(1)));
        when(answerRepository.saveAll(any())).thenReturn(new ArrayList<>());
        when(quizAttemptRepository.save(any(QuizAttempt.class))).thenReturn(testAttempt);

        QuizAttempt result = quizTakingService.submitQuiz(1L, questionAnswers);

        assertNotNull(result);
        verify(answerRepository).saveAll(any());
        verify(quizAttemptRepository).save(any(QuizAttempt.class));
    }

    @Test
    void testSubmitQuizAlreadyCompleted() {
        testAttempt.setIsCompleted(true);
        when(quizAttemptRepository.findById(1L)).thenReturn(Optional.of(testAttempt));

        assertThrows(RuntimeException.class, () -> {
            quizTakingService.submitQuiz(1L, new HashMap<>());
        });
    }

    @Test
    void testGetQuizQuestions() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(testQuiz));

        List<Question> result = quizTakingService.getQuizQuestions(1L, false);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("What is 2 + 2?", result.get(0).getQuestionText());
        assertEquals("What is the capital of France?", result.get(1).getQuestionText());
    }

    @Test
    void testGetQuizQuestionsRandomized() {
        when(quizRepository.findById(1L)).thenReturn(Optional.of(testQuiz));

        List<Question> result = quizTakingService.getQuizQuestions(1L, true);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertTrue(result.stream().anyMatch(q -> q.getQuestionText().equals("What is 2 + 2?")));
        assertTrue(result.stream().anyMatch(q -> q.getQuestionText().equals("What is the capital of France?")));
    }

    @Test
    void testGetTopScores() {
        List<QuizAttempt> topScores = Arrays.asList(testAttempt);
        when(quizAttemptRepository.findTopScoresByQuizId(1L)).thenReturn(topScores);

        List<QuizAttempt> result = quizTakingService.getTopScores(1L, 10);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testAttempt, result.get(0));
    }

    @Test
    void testGetUserHistory() {
        List<QuizAttempt> history = Arrays.asList(testAttempt);
        when(quizAttemptRepository.findByUserIdOrderByStartTimeDesc(1L)).thenReturn(history);

        List<QuizAttempt> result = quizTakingService.getUserHistory(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testAttempt, result.get(0));
    }
}