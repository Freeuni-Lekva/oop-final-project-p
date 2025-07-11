package com.quizapp.controllerTests;

import com.quizapp.model.Announcement;
import com.quizapp.model.User;
import com.quizapp.repository.AnnouncementRepository;
import com.quizapp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class AnnouncementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserRepository userRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Clean up before each test
        announcementRepository.deleteAll();
        userRepository.deleteAll();

        // Create test user
        testUser = new User();
        testUser.setUsername("testuser");
        testUser.setPasswordHash("password");
        testUser.setRole("ROLE_USER");
        testUser = userRepository.save(testUser);
    }

    @Test
    void getAnnouncements_ShouldReturnList() throws Exception {
        // Create an announcement
        Announcement announcement = new Announcement();
        announcement.setTitle("Test Announcement");
        announcement.setContent("This is a test announcement.");
        announcementRepository.save(announcement);

        mockMvc.perform(get("/api/announcements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Test Announcement"))
                .andExpect(jsonPath("$[0].content").value("This is a test announcement."));
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void postAnnouncement_AsAdmin_ShouldReturnAnnouncement() throws Exception {
        String jsonAnnouncement = """
            {
                "title": "New Announcement",
                "content": "This is a new announcement."
            }
            """;

        mockMvc.perform(post("/api/admin/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonAnnouncement))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New Announcement"))
                .andExpect(jsonPath("$.content").value("This is a new announcement."))
                .andExpect(jsonPath("$.createdAt").exists());
    }

    @Test
    @WithMockUser(username = "testuser", roles = "USER")
    void postAnnouncement_AsNonAdmin_ShouldReturnForbidden() throws Exception {
        String jsonAnnouncement = """
            {
                "title": "New Announcement",
                "content": "This is a new announcement."
            }
            """;

        mockMvc.perform(post("/api/admin/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonAnnouncement))
                .andExpect(status().isForbidden());
    }

    @Test
    void postAnnouncement_WithoutAuthentication_ShouldFail() throws Exception {
        String jsonAnnouncement = """
        {
            "title": "New Announcement",
            "content": "This is a new announcement."
        }
        """;

        mockMvc.perform(post("/api/admin/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonAnnouncement))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin", roles = "ADMIN")
    void postAnnouncement_WithInvalidData_ShouldReturnBadRequest() throws Exception {
        String jsonAnnouncement = """
            {
                "title": "",
                "content": ""
            }
            """;

        mockMvc.perform(post("/api/admin/announcements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonAnnouncement))
                .andExpect(status().isOk());
    }
}