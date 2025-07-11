package com.quizapp.controllerTests;

import com.quizapp.model.FriendRequest;
import com.quizapp.model.User;
import com.quizapp.repository.ChallengeRepository;
import com.quizapp.repository.FriendRequestRepository;
import com.quizapp.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class FriendControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private FriendRequestRepository friendRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChallengeRepository challengeRepository;

    @Autowired
    private EntityManager entityManager;

    private User requester;
    private User addressee;
    private FriendRequest friendRequest;

    @BeforeEach
    @Transactional
    void setUp() {
        // Clear dependent tables first
        challengeRepository.deleteAll();
        friendRequestRepository.deleteAll();
        userRepository.deleteAll();

        // Create and save users
        requester = new User();
        requester.setUsername("sandro");
        requester.setPasswordHash("password");
        requester.setRole("ROLE_USER");
        requester = userRepository.save(requester);  // Save without flush

        addressee = new User();
        addressee.setUsername("lela");
        addressee.setPasswordHash("password");
        addressee.setRole("ROLE_USER");
        addressee = userRepository.save(addressee);  // Save without flush


        friendRequest = new FriendRequest();
        friendRequest.setRequester(requester);
        friendRequest.setAddressee(addressee);
        friendRequest.setStatus(FriendRequest.Status.PENDING);
        friendRequest = friendRequestRepository.save(friendRequest);  // Save without flush

    }




    @Test
    void acceptFriendRequest_ShouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/friends/accept/" + friendRequest.getId())
                        .with(user(addressee.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Friend request accepted."));
    }

    @Test
    void rejectFriendRequest_ShouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/friends/reject/" + friendRequest.getId())
                        .with(user(addressee.getUsername()).roles("USER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Friend request rejected."));
    }


    @Test
    void searchUsers_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/friends/search")
                        .with(user(requester.getUsername()).roles("USER"))
                        .param("username", "le"))
                .andExpect(status().isOk());
    }


}