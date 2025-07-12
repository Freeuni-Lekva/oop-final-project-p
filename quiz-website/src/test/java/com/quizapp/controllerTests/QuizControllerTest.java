package com.quizapp.controllerTests;

import com.quizapp.model.Question;
import com.quizapp.model.Quiz;
import com.quizapp.model.User;
import com.quizapp.repository.*;
import com.quizapp.service.QuizService;
import com.quizapp.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class QuizControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private QuizService quizService;

    @Autowired
    private UserService userService;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Clean up related entities to avoid foreign key constraints
        quizAttemptRepository.deleteAll();
        answerRepository.deleteAll();
        challengeRepository.deleteAll();
        quizRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPasswordHash("password");
        testUser.setRole("ROLE_USER");
        testUser = userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "testuser")
    void createQuiz_ShouldReturnQuiz() throws Exception {
        String jsonQuiz = """
            {
                "title": "Sample Quiz",
                "description": "A sample description",
                "questions": [
                    {
                        "questionText": "What is 2+2?",
                        "type": "MULTIPLE_CHOICE",
                        "questionOrder": 1,
                        "options": [
                            {"text": "3", "isCorrect": false},
                            {"text": "4", "isCorrect": true}
                        ]
                    }
                ]
            }
            """;

        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonQuiz))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Sample Quiz"))
                .andExpect(jsonPath("$.description").value("A sample description"))
                .andExpect(jsonPath("$.questions", hasSize(1)))
                .andExpect(jsonPath("$.questions[0].questionText").value("What is 2+2?"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void createQuiz_WithoutQuestions_ShouldReturnBadRequest() throws Exception {
        String jsonQuiz = """
            {
                "title": "Empty Quiz",
                "description": "No questions"
            }
            """;

        mockMvc.perform(post("/api/quizzes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonQuiz))
                .andExpect(status().isBadRequest())
                .andExpect(status().reason(containsString("Quiz must have at least one question")));
    }

    @Test
    @WithMockUser(username = "testuser")
    void getAllQuizzes_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/quizzes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @WithMockUser(username = "testuser")
    void getQuiz_ShouldReturnQuiz() throws Exception {
        // Create quiz first
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Test Description");
        quiz.setCreatedBy(testUser);
        quiz.setQuestions(List.of());
        quiz = quizService.createQuiz(quiz);

        mockMvc.perform(get("/api/quizzes/" + quiz.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(quiz.getId()))
                .andExpect(jsonPath("$.title").value(quiz.getTitle()));
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void deleteQuiz_AsNonAdmin_ShouldReturnForbidden() throws Exception {
        // Create quiz first
        Quiz quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Test Description");
        quiz.setCreatedBy(testUser);
        quiz.setQuestions(List.of());
        quiz = quizService.createQuiz(quiz);

        mockMvc.perform(delete("/api/quizzes/" + quiz.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void deleteQuiz_AsAdmin_ShouldReturnOk() throws Exception {
        // Create quiz first
        Quiz quiz = new Quiz();
        quiz.setTitle("Delete Me");
        quiz.setDescription("To be deleted");
        quiz.setCreatedBy(testUser);
        quiz.setQuestions(List.of());
        quiz = quizService.createQuiz(quiz);

        mockMvc.perform(delete("/api/quizzes/" + quiz.getId()))
                .andExpect(status().isOk());
    }
}