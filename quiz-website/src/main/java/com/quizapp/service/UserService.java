package com.quizapp.service;

import com.quizapp.model.User;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.quizapp.dto.QuizHistoryItemDTO;
import com.quizapp.model.QuizAttempt;
import com.quizapp.repository.QuizRepository;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;

    public void register(String username, String rawPassword) {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        String encodedPassword = passwordEncoder.encode(rawPassword);
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(encodedPassword);
        userRepository.save(user);
    }

    public boolean authenticate(String username, String rawPassword) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        return userOpt.isPresent() &&
                passwordEncoder.matches(rawPassword, userOpt.get().getPasswordHash());
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    public boolean userExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<QuizHistoryItemDTO> getQuizHistoryForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndIsCompletedTrueOrderByStartTimeDesc(user.getId());
        return attempts.stream()
                .map(a -> new QuizHistoryItemDTO(
                        a.getQuiz().getTitle(),
                        a.getScore() != null ? a.getScore() : 0,
                        a.getTotalQuestions() != null ? a.getTotalQuestions() : 0,
                        a.getPercentage() != null ? a.getPercentage() : 0.0,
                        a.getEndTime()
                ))
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getUserAchievements(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        int created = quizRepository.findByCreatedBy(user).size();
        int taken = quizAttemptRepository.findByUserIdAndIsCompletedTrueOrderByStartTimeDesc(user.getId()).size();
        // High score: did user ever have the highest score on any quiz?
        boolean hasHighScore = false;
        var allQuizzes = quizRepository.findAll();
        for (var quiz : allQuizzes) {
            var topAttempts = quizAttemptRepository.findTopScoresByQuizId(quiz.getId());
            if (!topAttempts.isEmpty() && topAttempts.get(0).getUser().getId().equals(user.getId())) {
                hasHighScore = true;
                break;
            }
        }
        List<Map<String, Object>> achievements = new java.util.ArrayList<>();
        // Amateur Author
        achievements.add(Map.of(
            "key", "amateur_author",
            "name", "Amateur Author",
            "description", "Created your first quiz!",
            "shortDesc", "Create 1 quiz",
            "icon", "📝",
            "earned", created >= 1
        ));
        // Prolific Author
        achievements.add(Map.of(
            "key", "prolific_author",
            "name", "Prolific Author",
            "description", "Created 5 quizzes!",
            "shortDesc", "Create 5 quizzes",
            "icon", "📚",
            "earned", created >= 5
        ));
        // Prodigious Author
        achievements.add(Map.of(
            "key", "prodigious_author",
            "name", "Prodigious Author",
            "description", "Created 10 quizzes!",
            "shortDesc", "Create 10 quizzes",
            "icon", "🏆",
            "earned", created >= 10
        ));
        // Quiz Machine
        achievements.add(Map.of(
            "key", "quiz_machine",
            "name", "Quiz Machine",
            "description", "Took 10 quizzes!",
            "shortDesc", "Take 10 quizzes",
            "icon", "🤖",
            "earned", taken >= 10
        ));
        // I am the Greatest
        achievements.add(Map.of(
            "key", "i_am_the_greatest",
            "name", "I am the Greatest!",
            "description", "Held the highest score on a quiz!",
            "shortDesc", "Highest score on a quiz",
            "icon", "👑",
            "earned", hasHighScore
        ));
        return achievements;
    }
}