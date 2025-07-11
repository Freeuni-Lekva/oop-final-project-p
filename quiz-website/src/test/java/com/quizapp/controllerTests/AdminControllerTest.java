package com.quizapp.controllerTests;

import com.quizapp.model.User;
import com.quizapp.repository.UserRepository;
import com.quizapp.repository.FriendRequestRepository;
import com.quizapp.repository.MessageRepository;
import com.quizapp.repository.QuizAttemptRepository;
import com.quizapp.repository.AnswerRepository;
import com.quizapp.repository.QuizRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;


@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    void getAllUsers_Admin_ShouldReturnOk() throws Exception {
        User user = new User();
        user.setUsername("sandro");
        user.setPasswordHash("password");
        userRepository.save(user);

        mockMvc.perform(get("/api/admin/users")
                        .with(SecurityMockMvcRequestPostProcessors.user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void getAllUsers_NonAdmin_ShouldReturn403() throws Exception {
        Authentication auth = new TestingAuthenticationToken(
                "user", "pass",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );

        mockMvc.perform(get("/api/admin/users").principal(auth))
                .andExpect(status().isForbidden());
    }

    @Test
    void getStatistics_Admin_ShouldReturnOk() throws Exception {
        mockMvc.perform(get("/api/admin/statistics")
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk());
    }
}
