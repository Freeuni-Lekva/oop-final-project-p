package com.quizapp.service;

import com.quizapp.model.Challenge;
import com.quizapp.model.Quiz;
import com.quizapp.model.User;
import com.quizapp.repository.ChallengeRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChallengeService {

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private QuizRepository quizRepository;

    public Challenge sendChallenge(String challengerUsername, String challengedUsername, Long quizId) {
        User challenger = userRepository.findByUsername(challengerUsername)
                .orElseThrow(() -> new RuntimeException("Challenger not found"));

        User challenged = userRepository.findByUsername(challengedUsername)
                .orElseThrow(() -> new RuntimeException("Challenged user not found"));

        // We need to get the quiz from a different source since quizAttemptRepository.findById returns QuizAttempt
        // Let's use the QuizRepository instead
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        // Check if challenge already exists
        if (challengeRepository.existsByChallengerAndChallengedAndQuiz(challenger, challenged, quiz)) {
            throw new RuntimeException("Challenge already exists");
        }

        Challenge challenge = new Challenge(challenger, challenged, quiz);
        return challengeRepository.save(challenge);
    }

    public List<Challenge> getChallengesForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return challengeRepository.findByChallengedOrderByCreatedAtDesc(user);
    }

    public List<Challenge> getUnseenChallengesForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return challengeRepository.findUnseenChallengesForUser(user);
    }

    public void markChallengeAsSeen(Long challengeId) {
        Optional<Challenge> challengeOpt = challengeRepository.findById(challengeId);
        if (challengeOpt.isPresent()) {
            Challenge challenge = challengeOpt.get();
            challenge.setSeen(true);
            challengeRepository.save(challenge);
        }
    }

    public Integer getChallengerBestScore(Long quizId, String challengerUsername) {
        User challenger = userRepository.findByUsername(challengerUsername)
                .orElseThrow(() -> new RuntimeException("Challenger not found"));

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        return quizAttemptRepository.findBestScoreByUserAndQuiz(challenger.getId(), quizId)
                .stream()
                .findFirst()
                .map(attempt -> attempt.getScore())
                .orElse(0);
    }
}