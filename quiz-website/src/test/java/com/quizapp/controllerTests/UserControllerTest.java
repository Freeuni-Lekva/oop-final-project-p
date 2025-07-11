package com.quizapp.controllerTests;

import com.quizapp.controller.UserController;
import com.quizapp.model.User;
import com.quizapp.service.FriendService;
import com.quizapp.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class UserControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UserService userService;

    @Mock
    private FriendService friendService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Should return user profile for existing user")
    void testGetUserProfile() throws Exception {
        User user = new User();
        user.setId(1L);
        user.setUsername("testuser");

        when(userService.findByUsername("testuser")).thenReturn(user);
        when(friendService.getFriendStatus(anyString(), anyString())).thenReturn("SELF");

        mockMvc.perform(get("/api/users/testuser")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    @Test
    @WithMockUser(username = "testuser")
    @DisplayName("Should return 404 for non-existing user")
    void testGetUserProfileNotFound() throws Exception {
        when(userService.findByUsername("nouser")).thenReturn(null);

        mockMvc.perform(get("/api/users/nouser")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}
