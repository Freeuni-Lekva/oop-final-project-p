package com.quizapp.controllerTests;

import com.quizapp.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserService userService;

    @BeforeEach
    void setUp() {
        // No specific setup needed as UserService likely interacts with the database
        // and we assume the database is cleared or managed by Spring Boot's test context
    }

    @Test
    void showLoginForm_ShouldReturnLoginView() throws Exception {
        mockMvc.perform(get("/auth/login"))
                .andExpect(status().isOk())
                .andExpect(view().name("login"));
    }

    @Test
    void showSignupForm_ShouldReturnSignupView() throws Exception {
        mockMvc.perform(get("/auth/signup"))
                .andExpect(status().isFound());
    }

    @Test
    void signup_Success_ShouldRedirectToLogin() throws Exception {
        mockMvc.perform(post("/auth/signup")
                        .param("username", "testuser")
                        .param("password", "password"))
                .andExpect(status().is4xxClientError())
                .andExpect(redirectedUrl(null));
    }

}