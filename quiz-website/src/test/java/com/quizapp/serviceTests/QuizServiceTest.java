package com.quizapp.serviceTests;

import com.quizapp.model.Quiz;
import com.quizapp.model.Question;
import com.quizapp.repository.QuizRepository;
import com.quizapp.service.QuizService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private QuizService quizService;

    @Test
    void testCreateQuiz() {
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Description");
        Question question = new Question();
        quiz.setQuestions(List.of(question));
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        Quiz savedQuiz = quizService.createQuiz(quiz);

        assertThat(savedQuiz).isNotNull();
        assertThat(savedQuiz.getTitle()).isEqualTo("Test Quiz");
        assertThat(savedQuiz.getQuestions()).hasSize(1);
        assertThat(savedQuiz.getQuestions().get(0).getQuiz()).isEqualTo(savedQuiz);
        verify(quizRepository).save(quiz);
    }

    @Test
    void testCreateQuiz_NoQuestions() {
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Description");
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        Quiz savedQuiz = quizService.createQuiz(quiz);

        assertThat(savedQuiz).isNotNull();
        assertThat(savedQuiz.getTitle()).isEqualTo("Test Quiz");
        assertThat(savedQuiz.getQuestions()).isNull();
        verify(quizRepository).save(quiz);
    }

    @Test
    void testFindById_Success() {
        Quiz quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));

        Quiz foundQuiz = quizService.findById(1L);

        assertThat(foundQuiz).isNotNull();
        assertThat(foundQuiz.getId()).isEqualTo(1L);
        assertThat(foundQuiz.getTitle()).isEqualTo("Test Quiz");
        verify(quizRepository).findById(1L);
    }

    @Test
    void testFindById_NotFound() {
        when(quizRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> quizService.findById(999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Quiz not found");
        verify(quizRepository).findById(999L);
    }

    @Test
    void testGetAllQuizzes() {
        Quiz quiz1 = new Quiz();
        quiz1.setId(1L);
        quiz1.setTitle("Quiz 1");
        Quiz quiz2 = new Quiz();
        quiz2.setId(2L);
        quiz2.setTitle("Quiz 2");
        when(quizRepository.findAll()).thenReturn(List.of(quiz1, quiz2));

        List<Quiz> quizzes = quizService.getAllQuizzes();

        assertThat(quizzes).hasSize(2);
        assertThat(quizzes).extracting(Quiz::getTitle).containsExactlyInAnyOrder("Quiz 1", "Quiz 2");
        verify(quizRepository).findAll();
    }

    @Test
    void testGetAllQuizzes_Empty() {
        when(quizRepository.findAll()).thenReturn(List.of());

        List<Quiz> quizzes = quizService.getAllQuizzes();

        assertThat(quizzes).isEmpty();
        verify(quizRepository).findAll();
    }

    @Test
    void testDeleteQuiz() {
        doNothing().when(quizRepository).deleteById(1L);

        quizService.deleteQuiz(1L);

        verify(quizRepository).deleteById(1L);
    }
}