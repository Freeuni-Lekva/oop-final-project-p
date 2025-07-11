package com.quizapp.serviceTests;

import com.quizapp.model.Question;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.service.QuestionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @InjectMocks
    private QuestionService questionService;

    @Test
    void testGetAllQuestions_Success() {
        List<Question> questions = List.of(
                new Question("What is 2+2?", Question.QuestionType.MULTIPLE_CHOICE, List.of(), List.of("4")),
                new Question("What is H2O?", Question.QuestionType.QUESTION_RESPONSE, List.of(), List.of("Water"))
        );
        when(questionRepository.findAll()).thenReturn(questions);

        List<Question> result = questionService.getAllQuestions();

        assertEquals(2, result.size());
        assertEquals("What is 2+2?", result.get(0).getQuestionText());
        assertEquals("What is H2O?", result.get(1).getQuestionText());
        verify(questionRepository).findAll();
    }

    @Test
    void testGetQuestionById_Success() {
        Question question = new Question("What is 2+2?", Question.QuestionType.MULTIPLE_CHOICE, List.of(), List.of("4"));
        question.setId(1L);
        when(questionRepository.findById(1L)).thenReturn(Optional.of(question));

        Optional<Question> result = questionService.getQuestionById(1L);

        assertTrue(result.isPresent());
        assertEquals("What is 2+2?", result.get().getQuestionText());
        verify(questionRepository).findById(1L);
    }

    @Test
    void testCreateQuestion_Success() {
        Question question = new Question("What is 2+2?", Question.QuestionType.MULTIPLE_CHOICE, List.of(), List.of("4"));
        when(questionRepository.save(any(Question.class))).thenReturn(question);

        Question result = questionService.createQuestion(question);

        assertNotNull(result);
        assertEquals("What is 2+2?", result.getQuestionText());
        verify(questionRepository).save(question);
    }

    @Test
    void testUpdateQuestion_Success() {
        Question existingQuestion = new Question("Old question", Question.QuestionType.MULTIPLE_CHOICE, List.of(), List.of("4"));
        existingQuestion.setId(1L);
        Question updatedQuestionData = new Question("Updated question", Question.QuestionType.MULTIPLE_CHOICE, List.of(), List.of("4"));
        when(questionRepository.findById(1L)).thenReturn(Optional.of(existingQuestion));
        when(questionRepository.save(any(Question.class))).thenReturn(existingQuestion);

        Optional<Question> result = questionService.updateQuestion(1L, updatedQuestionData);

        assertTrue(result.isPresent());
        assertEquals("Updated question", result.get().getQuestionText());
        verify(questionRepository).findById(1L);
        verify(questionRepository).save(existingQuestion);
    }

    @Test
    void testDeleteQuestion_Success() {
        doNothing().when(questionRepository).deleteById(1L);

        questionService.deleteQuestion(1L);

        verify(questionRepository).deleteById(1L);
    }
}