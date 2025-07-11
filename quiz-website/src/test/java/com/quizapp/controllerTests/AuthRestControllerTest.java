package com.quizapp.controllerTests;

import com.quizapp.model.User;
import com.quizapp.repository.*;
import com.quizapp.service.QuestionService;
import com.quizapp.service.QuizService;
import com.quizapp.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthRestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private FriendRequestRepository friendRequestRepository;
    @Autowired
    private AnnouncementRepository announcementRepository;
    @Autowired
    private QuestionRepository questionRepository;
    @Autowired
    private QuizRepository quizRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private AnswerRepository answerRepository;
    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    private User testUser;

    @BeforeEach
    void setUp() {

        // ✅ Delete all related entities in the right order (child → parent)
        messageRepository.deleteAll();
        answerRepository.deleteAll();
        questionRepository.deleteAll();
        quizAttemptRepository.deleteAll();
        quizRepository.deleteAll();
        challengeRepository.deleteAll();
        friendRequestRepository.deleteAll();
        announcementRepository.deleteAll();

        // ✅ Flush to enforce order
//        messageRepository.flush();
//        answerRepository.flush();
//        questionRepository.flush();
//        quizAttemptRepository.flush();
//        quizRepository.flush();
//        challengeRepository.flush();
//        friendRequestRepository.flush();
//        announcementRepository.flush();

        // ✅ Then delete users
        userRepository.deleteAll();
        //userRepository.flush();

        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPasswordHash("password");
        testUser.setRole("ROLE_USER");
        userService.register("testuser", "password");
    }

    @Test
    void login_ShouldReturnSuccess() throws Exception {
        String jsonCredentials = """
            {
                "username": "testuser",
                "password": "password"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCredentials))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    void login_WithInvalidCredentials_ShouldReturnUnauthorized() throws Exception {
        String jsonCredentials = """
            {
                "username": "testuser",
                "password": "wrongpassword"
            }
            """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCredentials))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid username or password"));
    }

    @Test
    void register_ShouldReturnSuccess() throws Exception {
        String jsonCredentials = """
            {
                "username": "newuser",
                "password": "newpassword"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCredentials))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registration successful"))
                .andExpect(jsonPath("$.username").value("newuser"));
    }

    @Test
    void register_WithExistingUsername_ShouldReturnBadRequest() throws Exception {
        String jsonCredentials = """
            {
                "username": "testuser",
                "password": "password"
            }
            """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonCredentials))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Username already exists")));
    }

    @Test
    void getUserByUsername_ShouldReturnUser() throws Exception {
        mockMvc.perform(get("/api/auth/user/testuser"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.id").isNumber());
    }

}