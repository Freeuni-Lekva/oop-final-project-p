package com.quizapp.repositoryTests;

import com.quizapp.model.Answer;
import com.quizapp.repository.AnswerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class AnswerRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private AnswerRepository answerRepository;


    @Test
    void testFindById_NotFound() {
        Optional<Answer> foundAnswer = answerRepository.findById(999L);

        assertThat(foundAnswer).isNotPresent();
    }


    @Test
    void testFindByQuizAttemptIdOrderByQuestionNumber_Empty() {
        List<Answer> answers = answerRepository.findByQuizAttemptIdOrderByQuestionNumber(999L);

        assertThat(answers).isEmpty();
    }



    @Test
    void testFindByUserIdOrderByQuizAttemptIdAscQuestionNumberAsc_Empty() {
        List<Answer> answers = answerRepository.findByUserIdOrderByQuizAttemptIdAscQuestionNumberAsc(999L);

        assertThat(answers).isEmpty();
    }

    @Test
    void testFindByQuizAttemptIdAndQuestionId_NotFound() {
        Answer foundAnswer = answerRepository.findByQuizAttemptIdAndQuestionId(999L, 999L);

        assertThat(foundAnswer).isNull();
    }

    @Test
    void testFindByQuizAttemptIdAndIsCorrectTrue_Empty() {
        List<Answer> correctAnswers = answerRepository.findByQuizAttemptIdAndIsCorrectTrue(999L);

        assertThat(correctAnswers).isEmpty();
    }
}