package com.quizapp.controller;

import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;
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

        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted successfully.");
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
