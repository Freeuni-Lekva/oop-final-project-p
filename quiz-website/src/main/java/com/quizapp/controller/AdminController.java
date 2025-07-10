package com.quizapp.controller;

import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.FriendRequestRepository;
import com.quizapp.repository.MessageRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.AnswerRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final MessageRepository messageRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final AnswerRepository answerRepository;
    private final QuizRepository quizRepository;

    // ✅ Get all users
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers(Authentication authentication) {
        if (!SecurityUtils.isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(userRepository.findAll());
    }

    // ✅ Promote user to admin
    @PostMapping("/promote/{id}")
    public ResponseEntity<String> promoteToAdmin(@PathVariable Long id, Authentication authentication) {
        if (!SecurityUtils.isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setRole("ROLE_ADMIN");
            userRepository.save(user);
            return ResponseEntity.ok("User promoted to admin.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ Delete user
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id, Authentication authentication) {
        if (!SecurityUtils.isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }

        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = userOpt.get();
        String username = user.getUsername();

        // 1. Delete all friend requests involving this user
        friendRequestRepository.deleteAll(friendRequestRepository.findByRequester(user));
        friendRequestRepository.deleteAll(friendRequestRepository.findByAddressee(user));

        // 2. Remove this user from all friends' lists (bidirectional)
        for (User u : userRepository.findAll()) {
            if (u.getFriends().remove(user)) {
                userRepository.save(u);
            }
        }
        user.getFriends().clear();
        userRepository.save(user);

        // 3. Delete all messages sent or received by this user
        messageRepository.deleteAll(messageRepository.findBySenderUsernameAndReceiverUsernameOrderByTimestampDesc(username, username));
        // Delete all messages where this user is sender or receiver
        messageRepository.deleteAll(messageRepository.findAll().stream().filter(m -> m.getSenderUsername().equals(username) || m.getReceiverUsername().equals(username)).toList());

        // 4. Delete all quiz attempts and answers by this user
        var attempts = quizAttemptRepository.findByUserIdOrderByStartTimeDesc(user.getId());
        for (var attempt : attempts) {
            answerRepository.deleteAll(answerRepository.findByQuizAttemptIdOrderByQuestionNumber(attempt.getId()));
            quizAttemptRepository.delete(attempt);
        }

        // 5. Finally, delete the user
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully.");
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics(Authentication authentication) {
        if (!SecurityUtils.isAdmin(authentication)) {
            return ResponseEntity.status(403).build();
        }
        long userCount = userRepository.count();
        long quizCount = quizRepository.count();
        // Count only completed, non-practice quiz attempts
        long quizAttempts = quizAttemptRepository.findAll().stream().filter(a -> Boolean.TRUE.equals(a.getIsCompleted()) && Boolean.FALSE.equals(a.getIsPracticeMode())).count();
        return ResponseEntity.ok(
            java.util.Map.of(
                "users", userCount,
                "quizzes", quizCount,
                "quizzesTaken", quizAttempts
            )
        );
    }
}
