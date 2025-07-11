package com.quizapp.serviceTests;

import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Should register a new user")
    void testRegisterNewUser() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode("password")).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        userService.register("testuser", "password");

        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception if username exists")
    void testRegisterExistingUser() {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(new User()));

        assertThrows(RuntimeException.class, () -> userService.register("testuser", "password"));
    }

    @Test
    @DisplayName("Should authenticate user with correct password")
    void testAuthenticateUser() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("encoded");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("password", "encoded")).thenReturn(true);

        assertThat(userService.authenticate("testuser", "password")).isTrue();
    }

    @Test
    @DisplayName("Should not authenticate user with wrong password")
    void testAuthenticateUserWrongPassword() {
        User user = new User();
        user.setUsername("testuser");
        user.setPasswordHash("encoded");

        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded")).thenReturn(false);

        assertThat(userService.authenticate("testuser", "wrong")).isFalse();
    }
}
