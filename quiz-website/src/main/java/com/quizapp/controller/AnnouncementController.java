package com.quizapp.controller;

import com.quizapp.model.Announcement;
import com.quizapp.repository.AnnouncementRepository;
import com.quizapp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AnnouncementController {

    private final AnnouncementRepository announcementRepository;

    // ✅ Public endpoint to get all announcements
    @GetMapping("/announcements")
    public ResponseEntity<List<Announcement>> getAnnouncements() {
        List<Announcement> announcements = announcementRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(announcements);
    }

    // ✅ Admin-only endpoint to post new announcement
    @PostMapping("/admin/announcements")
    public ResponseEntity<?> postAnnouncement(
            @RequestBody Announcement announcement,
            Authentication authentication
    ) {
        if (!SecurityUtils.isAdmin(authentication)) {
            return ResponseEntity.status(403).body("Only admins can post announcements.");
        }

        Announcement saved = announcementRepository.save(announcement);
        return ResponseEntity.ok(saved);
    }
}
