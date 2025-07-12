package com.quizapp.repositoryTests;

import com.quizapp.model.Challenge;
import com.quizapp.model.User;
import com.quizapp.model.Quiz;
import com.quizapp.repository.ChallengeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class ChallengeRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Test
    void testSaveChallenge() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge = new Challenge(challenger, challenged, quiz);
        challenge.setSeen(false);
        challenge.setCreatedAt(LocalDateTime.now());

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        Challenge savedChallenge = challengeRepository.save(challenge);

        assertThat(savedChallenge).isNotNull();
        assertThat(savedChallenge.getId()).isNotNull();
        assertThat(savedChallenge.getChallenger().getUsername()).isEqualTo("challenger");
        assertThat(savedChallenge.getChallenged().getUsername()).isEqualTo("challenged");
        assertThat(savedChallenge.getQuiz().getTitle()).isEqualTo("Test Quiz");
        assertThat(savedChallenge.isSeen()).isFalse();
        assertThat(savedChallenge.getCreatedAt()).isNotNull();
    }

    @Test
    void testFindById() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge = new Challenge(challenger, challenged, quiz);
        challenge.setSeen(false);
        challenge.setCreatedAt(LocalDateTime.now());

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        Long id = entityManager.persistAndGetId(challenge, Long.class);

        Optional<Challenge> foundChallenge = challengeRepository.findById(id);

        assertThat(foundChallenge).isPresent();
        assertThat(foundChallenge.get().getChallenger().getUsername()).isEqualTo("challenger");
        assertThat(foundChallenge.get().getChallenged().getUsername()).isEqualTo("challenged");
        assertThat(foundChallenge.get().isSeen()).isFalse();
    }

    @Test
    void testFindById_NotFound() {
        Optional<Challenge> foundChallenge = challengeRepository.findById(999L);

        assertThat(foundChallenge).isNotPresent();
    }

    @Test
    void testFindAll() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge1 = new Challenge(challenger, challenged, quiz);
        challenge1.setSeen(false);
        challenge1.setCreatedAt(LocalDateTime.now());
        Challenge challenge2 = new Challenge(challenger, challenged, quiz);
        challenge2.setSeen(true);
        challenge2.setCreatedAt(LocalDateTime.now());

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        entityManager.persist(challenge1);
        entityManager.persist(challenge2);

        List<Challenge> challenges = challengeRepository.findAll();

        assertThat(challenges).hasSize(2);
        assertThat(challenges).extracting(challenge -> challenge.getChallenged().getUsername())
                .containsExactlyInAnyOrder("challenged", "challenged");
    }

    @Test
    void testDeleteById() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge = new Challenge(challenger, challenged, quiz);
        challenge.setSeen(false);
        challenge.setCreatedAt(LocalDateTime.now());

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        Long id = entityManager.persistAndGetId(challenge, Long.class);

        challengeRepository.deleteById(id);

        Optional<Challenge> foundChallenge = challengeRepository.findById(id);
        assertThat(foundChallenge).isNotPresent();
    }

    @Test
    void testFindByChallengedOrderByCreatedAtDesc() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge1 = new Challenge(challenger, challenged, quiz);
        challenge1.setCreatedAt(LocalDateTime.of(2023, 1, 1, 12, 0));
        Challenge challenge2 = new Challenge(challenger, challenged, quiz);
        challenge2.setCreatedAt(LocalDateTime.of(2023, 1, 2, 12, 0));

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        entityManager.persist(challenge1);
        entityManager.persist(challenge2);

        List<Challenge> challenges = challengeRepository.findByChallengedOrderByCreatedAtDesc(challenged);

        assertThat(challenges).hasSize(2);
        assertThat(challenges.get(0).getCreatedAt()).isEqualTo(LocalDateTime.of(2023, 1, 2, 12, 0));
        assertThat(challenges.get(1).getCreatedAt()).isEqualTo(LocalDateTime.of(2023, 1, 1, 12, 0));
    }

    @Test
    void testFindByChallengedOrderByCreatedAtDesc_Empty() {
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        entityManager.persist(challenged);

        List<Challenge> challenges = challengeRepository.findByChallengedOrderByCreatedAtDesc(challenged);

        assertThat(challenges).isEmpty();
    }

    @Test
    void testFindByChallengedAndSeenFalseOrderByCreatedAtDesc() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge1 = new Challenge(challenger, challenged, quiz);
        challenge1.setSeen(false);
        challenge1.setCreatedAt(LocalDateTime.of(2023, 1, 1, 12, 0));
        Challenge challenge2 = new Challenge(challenger, challenged, quiz);
        challenge2.setSeen(true);
        challenge2.setCreatedAt(LocalDateTime.of(2023, 1, 2, 12, 0));

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        entityManager.persist(challenge1);
        entityManager.persist(challenge2);

        List<Challenge> challenges = challengeRepository.findByChallengedAndSeenFalseOrderByCreatedAtDesc(challenged);

        assertThat(challenges).hasSize(1);
        assertThat(challenges.get(0).isSeen()).isFalse();
        assertThat(challenges.get(0).getCreatedAt()).isEqualTo(LocalDateTime.of(2023, 1, 1, 12, 0));
    }

    @Test
    void testFindByChallengedAndSeenFalseOrderByCreatedAtDesc_Empty() {
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        entityManager.persist(challenged);

        List<Challenge> challenges = challengeRepository.findByChallengedAndSeenFalseOrderByCreatedAtDesc(challenged);

        assertThat(challenges).isEmpty();
    }

    @Test
    void testFindUnseenChallengesForUser() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge1 = new Challenge(challenger, challenged, quiz);
        challenge1.setSeen(false);
        challenge1.setCreatedAt(LocalDateTime.of(2023, 1, 1, 12, 0));
        Challenge challenge2 = new Challenge(challenger, challenged, quiz);
        challenge2.setSeen(true);
        challenge2.setCreatedAt(LocalDateTime.of(2023, 1, 2, 12, 0));

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        entityManager.persist(challenge1);
        entityManager.persist(challenge2);

        List<Challenge> challenges = challengeRepository.findUnseenChallengesForUser(challenged);

        assertThat(challenges).hasSize(1);
        assertThat(challenges.get(0).isSeen()).isFalse();
        assertThat(challenges.get(0).getCreatedAt()).isEqualTo(LocalDateTime.of(2023, 1, 1, 12, 0));
    }

    @Test
    void testFindUnseenChallengesForUser_Empty() {
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        entityManager.persist(challenged);

        List<Challenge> challenges = challengeRepository.findUnseenChallengesForUser(challenged);

        assertThat(challenges).isEmpty();
    }

    @Test
    void testExistsByChallengerAndChallengedAndQuiz() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        Challenge challenge = new Challenge(challenger, challenged, quiz);
        challenge.setSeen(false);
        challenge.setCreatedAt(LocalDateTime.now());

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);
        entityManager.persist(challenge);

        boolean exists = challengeRepository.existsByChallengerAndChallengedAndQuiz(challenger, challenged, quiz);

        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByChallengerAndChallengedAndQuiz_NotExists() {
        User challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("hashed_password");
        challenger.setRole("USER");
        User challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("hashed_password");
        challenged.setRole("USER");
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");

        entityManager.persist(challenger);
        entityManager.persist(challenged);
        entityManager.persist(quiz);

        boolean exists = challengeRepository.existsByChallengerAndChallengedAndQuiz(challenger, challenged, quiz);

        assertThat(exists).isFalse();
    }
}