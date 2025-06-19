package com.quizapp;

import com.quizapp.model.Quiz;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.QuizService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)

public class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private QuizService quizService;

    @BeforeEach
    void setUp() {

    }

    @Test
    void whenGetAllQuizzes_thenReturnListOfQuizzes() {
        // Given: Define the behavior of the mocked repository
        Quiz quiz1 = new Quiz();
        quiz1.setId(1L);
        quiz1.setTitle("Mock Quiz 1");
        Quiz quiz2 = new Quiz();
        quiz2.setId(2L);
        quiz2.setTitle("Mock Quiz 2");
        List<Quiz> mockQuizzes = Arrays.asList(quiz1, quiz2);

        when(quizRepository.findAll()).thenReturn(mockQuizzes); // When findAll() is called on the mock, return our list

        // When: Call the service method
        List<Quiz> result = quizService.getAllQuizzes();

        // Then: Assert the result
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Mock Quiz 1");
        verify(quizRepository, times(1)).findAll(); // Verify that findAll was called exactly once on the mock
    }

    @Test
    void whenCreateQuiz_thenReturnSavedQuiz() {
        // Given: A quiz object to be saved
        Quiz newQuiz = new Quiz();
        newQuiz.setTitle("New Quiz Title");
        newQuiz.setDescription("New Quiz Description");

        // Define mock behavior: when save is called with any Quiz object, return it with an ID
        when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> {
            Quiz savedQuiz = invocation.getArgument(0, Quiz.class);
            savedQuiz.setId(3L); // Simulate ID generation by the DB
            return savedQuiz;
        });

        // When: Call the service method to create a quiz
        Quiz created = quizService.createQuiz(newQuiz);

        // Then: Assert the result
        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo(3L);
        assertThat(created.getTitle()).isEqualTo("New Quiz Title");
        verify(quizRepository, times(1)).save(any(Quiz.class)); // Verify save was called
    }

    @Test
    void whenGetQuizById_thenReturnQuiz() {
        // Given: A quiz object and mock repository behavior
        Quiz quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz)); // Mock return for specific ID

        // When: Call the service method
        Optional<Quiz> found = quizService.getQuizById(1L);

        // Then: Assert the result
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test Quiz");
        verify(quizRepository, times(1)).findById(1L);
    }

}
