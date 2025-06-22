package com.quizapp.repository;

import com.quizapp.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // Optional: find the latest announcements first
    List<Announcement> findAllByOrderByCreatedAtDesc();
}