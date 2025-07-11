package com.quizapp.repositoryTests;

import com.quizapp.model.Quiz;
import com.quizapp.model.User;
import com.quizapp.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ExtendWith(MockitoExtension.class)
class QuizRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private QuizRepository quizRepository;

    @Mock
    private User user;

    @Test
    void testSaveQuiz() {
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Description");

        Quiz savedQuiz = quizRepository.save(quiz);

        assertThat(savedQuiz).isNotNull();
        assertThat(savedQuiz.getId()).isNotNull();
        assertThat(savedQuiz.getTitle()).isEqualTo("Test Quiz");
        assertThat(savedQuiz.getDescription()).isEqualTo("Description");
    }

    @Test
    void testFindById() {
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Description");
        Long id = entityManager.persistAndGetId(quiz, Long.class);

        Optional<Quiz> foundQuiz = quizRepository.findById(id);

        assertThat(foundQuiz).isPresent();
        assertThat(foundQuiz.get().getTitle()).isEqualTo("Test Quiz");
    }

    @Test
    void testFindById_NotFound() {
        Optional<Quiz> foundQuiz = quizRepository.findById(999L);

        assertThat(foundQuiz).isNotPresent();
    }

    @Test
    void testFindAll() {
        Quiz quiz1 = new Quiz();
        quiz1.setTitle("Quiz 1");
        quiz1.setDescription("Desc 1");
        Quiz quiz2 = new Quiz();
        quiz2.setTitle("Quiz 2");
        quiz2.setDescription("Desc 2");

        entityManager.persist(quiz1);
        entityManager.persist(quiz2);

        List<Quiz> quizzes = quizRepository.findAll();

        assertThat(quizzes).hasSize(2);
        assertThat(quizzes).extracting(Quiz::getTitle).containsExactlyInAnyOrder("Quiz 1", "Quiz 2");
    }

    @Test
    void testDeleteById() {
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Description");
        Long id = entityManager.persistAndGetId(quiz, Long.class);

        quizRepository.deleteById(id);

        Optional<Quiz> foundQuiz = quizRepository.findById(id);
        assertThat(foundQuiz).isNotPresent();
    }

}