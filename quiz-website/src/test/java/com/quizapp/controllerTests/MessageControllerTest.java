package com.quizapp.controllerTests;

import com.quizapp.model.Message;
import com.quizapp.model.User;
import com.quizapp.repository.ChallengeRepository;
import com.quizapp.repository.QuizRepository;
import com.quizapp.repository.UserRepository;
import com.quizapp.service.FriendService;
import com.quizapp.service.MessageService;
import com.quizapp.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class MessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @Autowired
    private FriendService friendService;

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private QuizRepository quizRepository;

    private User sender;
    private User receiver;

    @BeforeEach
    void setUp() {
        challengeRepository.deleteAll();
        quizRepository.deleteAll();
        userRepository.deleteAll();

        sender = new User();
        sender.setUsername("sender");
        sender.setPasswordHash("password");
        sender.setRole("ROLE_USER");
        sender = userRepository.saveAndFlush(sender);

        receiver = new User();
        receiver.setUsername("receiver");
        receiver.setPasswordHash("password");
        receiver.setRole("ROLE_USER");
        receiver = userRepository.saveAndFlush(receiver);

        // Ensure friendship is established
        friendService.addFriend(sender.getUsername(), receiver.getUsername());
    }

    @Test
    @WithMockUser(username = "sender")
    void sendMessage_WithInvalidReceiver_ShouldReturnBadRequest() throws Exception {
        String jsonPayload = """
            {
                "receiverUsername": "nonexistent",
                "content": "Hello!"
            }
            """;

        mockMvc.perform(post("/api/messages/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User does not exist."));
    }

    @Test
    @WithMockUser(username = "sender")
    void sendMessage_WithEmptyContent_ShouldReturnBadRequest() throws Exception {
        String jsonPayload = """
            {
                "receiverUsername": "receiver",
                "content": ""
            }
            """;

        mockMvc.perform(post("/api/messages/send")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Receiver and content are required."));
    }
}