package com.quizapp;

import com.quizapp.model.Quiz;
import com.quizapp.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
public class QuizRepositoryTest {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private TestEntityManager entityManager;
    @Test
    @ExtendWith(SpringExtension.class)

    public void whenFindByTitle_thenReturnQuiz() {
        Quiz testQuiz = new Quiz();
        testQuiz.setTitle("Science Basics");
        testQuiz.setDescription("Fundamental science questions");
        entityManager.persist(testQuiz);
        entityManager.flush();

        Optional<Quiz> found = quizRepository.findByTitle("Science Basics"); // You'll need to add this method to QuizRepository

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo(testQuiz.getTitle());
    }

    @Test
    public void whenSaveQuiz_thenIdIsGenerated() {
        Quiz newQuiz = new Quiz();
        newQuiz.setTitle("History Trivia");
        newQuiz.setDescription("Questions about world history");

        Quiz savedQuiz = quizRepository.save(newQuiz);

        assertThat(savedQuiz.getId()).isNotNull();
        assertThat(savedQuiz.getTitle()).isEqualTo("History Trivia");
    }

    @Test
    public void whenDeleteQuiz_thenQuizIsNotFound() {
        Quiz quizToDelete = new Quiz();
        quizToDelete.setTitle("Temporary Quiz");
        quizToDelete.setDescription("To be deleted");
        entityManager.persist(quizToDelete);
        entityManager.flush();

        quizRepository.deleteById(quizToDelete.getId());

        Optional<Quiz> found = quizRepository.findById(quizToDelete.getId());
        assertThat(found).isNotPresent();
    }
}
