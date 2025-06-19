package com.quizapp;

import com.quizapp.model.Quiz;
import com.quizapp.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataJpaTest
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
        entityManager.persist(testQuiz); // Save to the in-memory database
        entityManager.flush(); // Ensure changes are written to the database

        // When: Call the repository method
        Optional<Quiz> found = quizRepository.findByTitle("Science Basics"); // You'll need to add this method to QuizRepository

        // Then: Assert that the quiz was found and its title matches
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo(testQuiz.getTitle());
    }

    @Test
    public void whenSaveQuiz_thenIdIsGenerated() {
        // Given: A new Quiz object
        Quiz newQuiz = new Quiz();
        newQuiz.setTitle("History Trivia");
        newQuiz.setDescription("Questions about world history");

        // When: Save the quiz using the repository
        Quiz savedQuiz = quizRepository.save(newQuiz);

        // Then: Assert that an ID was generated (meaning it was persisted)
        assertThat(savedQuiz.getId()).isNotNull();
        assertThat(savedQuiz.getTitle()).isEqualTo("History Trivia");
    }

    @Test
    public void whenDeleteQuiz_thenQuizIsNotFound() {
        // Given: A quiz that exists in the database
        Quiz quizToDelete = new Quiz();
        quizToDelete.setTitle("Temporary Quiz");
        quizToDelete.setDescription("To be deleted");
        entityManager.persist(quizToDelete);
        entityManager.flush();

        // When: Delete the quiz by its ID
        quizRepository.deleteById(quizToDelete.getId());

        // Then: Assert that the quiz can no longer be found
        Optional<Quiz> found = quizRepository.findById(quizToDelete.getId());
        assertThat(found).isNotPresent();
    }
}
