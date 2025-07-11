package com.quizapp.controllerTests;

import com.quizapp.model.Challenge;
import com.quizapp.model.Quiz;
import com.quizapp.model.User;
import com.quizapp.repository.ChallengeRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.UserRepository;
import com.quizapp.service.ChallengeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ChallengeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ChallengeService challengeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    private User challenger;
    private User challenged;
    private Quiz quiz;

    @BeforeEach
    void setUp() {
        challengeRepository.deleteAll();
        quizRepository.deleteAll();
        userRepository.deleteAll();

        challenger = new User();
        challenger.setUsername("challenger");
        challenger.setPasswordHash("password");
        challenger.setRole("ROLE_USER");
        challenger = userRepository.save(challenger);

        challenged = new User();
        challenged.setUsername("challenged");
        challenged.setPasswordHash("password");
        challenged.setRole("ROLE_USER");
        challenged = userRepository.save(challenged);

        quiz = new Quiz();
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Test Description");
        quiz.setCreatedBy(challenger);
        quiz.setQuestions(List.of());
        quiz = quizRepository.save(quiz);
    }

    @Test
    void sendChallenge_ShouldReturnChallenge() throws Exception {
        String jsonRequest = """
            {
                "challengerUsername": "challenger",
                "challengedUsername": "challenged",
                "quizId": %d
            }
            """.formatted(quiz.getId());

        mockMvc.perform(post("/api/challenges/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.challenger.username").value("challenger"))
                .andExpect(jsonPath("$.challenged.username").value("challenged"))
                .andExpect(jsonPath("$.quiz.id").value(quiz.getId()));
    }

    @Test
    void sendChallenge_WithInvalidQuizId_ShouldReturnBadRequest() throws Exception {
        String jsonRequest = """
            {
                "challengerUsername": "challenger",
                "challengedUsername": "challenged",
                "quizId": 999
            }
            """;

        mockMvc.perform(post("/api/challenges/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonRequest))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("Error sending challenge")));
    }

    @Test
    void getChallengesForUser_ShouldReturnChallenges() throws Exception {
        Challenge challenge = challengeService.sendChallenge("challenger", "challenged", quiz.getId());

        mockMvc.perform(get("/api/challenges/for-user/challenged"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].challenger.username").value("challenger"));
    }

    @Test
    void getUnseenChallengesForUser_ShouldReturnUnseenChallenges() throws Exception {
        Challenge challenge = challengeService.sendChallenge("challenger", "challenged", quiz.getId());

        mockMvc.perform(get("/api/challenges/unseen/challenged"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].seen").value(false));
    }

    @Test
    void markChallengeAsSeen_ShouldReturnOk() throws Exception {
        Challenge challenge = challengeService.sendChallenge("challenger", "challenged", quiz.getId());

        mockMvc.perform(put("/api/challenges/{challengeId}/mark-seen", challenge.getId()))
                .andExpect(status().isOk());
    }

    @Test
    void getChallengerBestScore_ShouldReturnScore() throws Exception {
        mockMvc.perform(get("/api/challenges/challenger-best-score/{quizId}/{challengerUsername}", quiz.getId(), "challenger"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isNumber());
    }
}