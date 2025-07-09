package com.quizapp.service;

import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.dto.QuizHistoryItemDTO;
import com.quizapp.model.QuizAttempt;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final QuizAttemptRepository quizAttemptRepository;

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
}
