package com.quizapp.serviceTests;

import com.quizapp.model.Challenge;
import com.quizapp.model.Quiz;
import com.quizapp.model.QuizAttempt;
import com.quizapp.model.User;
import com.quizapp.repository.ChallengeRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.UserRepository;
import com.quizapp.service.ChallengeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChallengeServiceTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private ChallengeService challengeService;

    private User challenger;
    private User challenged;
    private Quiz quiz;

    @BeforeEach
    void setUp() {
        challenger = new User();
        challenger.setId(1L);
        challenger.setUsername("challenger");

        challenged = new User();
        challenged.setId(2L);
        challenged.setUsername("challenged");

        quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        quiz.setQuestions(List.of());
    }

    @Test
    void testSendChallenge_Success() {
        when(userRepository.findByUsername("challenger")).thenReturn(Optional.of(challenger));
        when(userRepository.findByUsername("challenged")).thenReturn(Optional.of(challenged));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(challengeRepository.existsByChallengerAndChallengedAndQuiz(challenger, challenged, quiz)).thenReturn(false);
        when(challengeRepository.save(any(Challenge.class))).thenReturn(new Challenge(challenger, challenged, quiz));

        Challenge result = challengeService.sendChallenge("challenger", "challenged", 1L);

        assertNotNull(result);
        assertEquals(challenger, result.getChallenger());
        assertEquals(challenged, result.getChallenged());
        assertEquals(quiz, result.getQuiz());
        verify(challengeRepository).save(any(Challenge.class));
    }

    @Test
    void testGetChallengesForUser_Success() {
        when(userRepository.findByUsername("challenged")).thenReturn(Optional.of(challenged));
        List<Challenge> challenges = List.of(new Challenge(challenger, challenged, quiz));
        when(challengeRepository.findByChallengedOrderByCreatedAtDesc(challenged)).thenReturn(challenges);

        List<Challenge> result = challengeService.getChallengesForUser("challenged");

        assertEquals(1, result.size());
        assertEquals(challenges, result);
        verify(challengeRepository).findByChallengedOrderByCreatedAtDesc(challenged);
    }

    @Test
    void testGetUnseenChallengesForUser_Success() {
        when(userRepository.findByUsername("challenged")).thenReturn(Optional.of(challenged));
        List<Challenge> challenges = List.of(new Challenge(challenger, challenged, quiz));
        when(challengeRepository.findUnseenChallengesForUser(challenged)).thenReturn(challenges);

        List<Challenge> result = challengeService.getUnseenChallengesForUser("challenged");

        assertEquals(1, result.size());
        assertEquals(challenges, result);
        verify(challengeRepository).findUnseenChallengesForUser(challenged);
    }



    @Test
    void testGetChallengerBestScore_Success() {
        when(userRepository.findByUsername("challenger")).thenReturn(Optional.of(challenger));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        QuizAttempt attempt = new QuizAttempt(challenger, quiz);
        attempt.setScore(10);
        when(quizAttemptRepository.findBestScoreByUserAndQuiz(challenger.getId(), 1L)).thenReturn(List.of(attempt));

        Integer score = challengeService.getChallengerBestScore(1L, "challenger");

        assertEquals(10, score);
        verify(quizAttemptRepository).findBestScoreByUserAndQuiz(challenger.getId(), 1L);
    }

    @Test
    void testGetChallengerBestScore_NoAttempts() {
        when(userRepository.findByUsername("challenger")).thenReturn(Optional.of(challenger));
        when(quizRepository.findById(1L)).thenReturn(Optional.of(quiz));
        when(quizAttemptRepository.findBestScoreByUserAndQuiz(challenger.getId(), 1L)).thenReturn(List.of());

        Integer score = challengeService.getChallengerBestScore(1L, "challenger");

        assertEquals(0, score);
        verify(quizAttemptRepository).findBestScoreByUserAndQuiz(challenger.getId(), 1L);
    }
}