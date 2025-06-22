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
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.SpringBootTest;

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
        Quiz quiz1 = new Quiz();
        quiz1.setId(1L);
        quiz1.setTitle("Mock Quiz 1");
        Quiz quiz2 = new Quiz();
        quiz2.setId(2L);
        quiz2.setTitle("Mock Quiz 2");
        List<Quiz> mockQuizzes = Arrays.asList(quiz1, quiz2);

        when(quizRepository.findAll()).thenReturn(mockQuizzes);

        List<Quiz> result = quizService.getAllQuizzes();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTitle()).isEqualTo("Mock Quiz 1");
        verify(quizRepository, times(1)).findAll(); // Verify that findAll was called exactly once on the mock
    }

    @Test
    void whenCreateQuiz_thenReturnSavedQuiz() {
        Quiz newQuiz = new Quiz();
        newQuiz.setTitle("New Quiz Title");
        newQuiz.setDescription("New Quiz Description");

        when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> {
            Quiz savedQuiz = invocation.getArgument(0, Quiz.class);
            savedQuiz.setId(3L);
            return savedQuiz;
        });

        Quiz created = quizService.createQuiz(newQuiz);

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo(3L);
        assertThat(created.getTitle()).isEqualTo("New Quiz Title");
        verify(quizRepository, times(1)).save(any(Quiz.class)); // Verify save was called
    }

    @Test
    void whenGetQuizById_thenReturnQuiz() {
        Quiz quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");

        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz)); // Mock return for specific ID

        Optional<Quiz> found = quizService.getQuizById(1L);

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test Quiz");
        verify(quizRepository, times(1)).findById(1L);
    }

}
