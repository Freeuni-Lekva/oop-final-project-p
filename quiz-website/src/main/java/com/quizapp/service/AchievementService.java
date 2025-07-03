package com.quizapp.service;

import com.quizapp.model.*;
import com.quizapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {
    private final AchievementRepository achievementRepository;
    private final UserAchievementRepository userAchievementRepository;

    @Autowired
    public AchievementService(AchievementRepository achievementRepository, UserAchievementRepository userAchievementRepository) {
        this.achievementRepository = achievementRepository;
        this.userAchievementRepository = userAchievementRepository;
    }

    public void awardAchievement(User user, String achievementCode) {
        Achievement achievement = achievementRepository.findByCode(achievementCode);
        if (achievement == null) return;
        if (userAchievementRepository.existsByUserAndAchievement(user, achievement)) return;
        UserAchievement userAchievement = new UserAchievement();
        userAchievement.setUser(user);
        userAchievement.setAchievement(achievement);
        userAchievement.setDateAwarded(LocalDateTime.now());
        userAchievementRepository.save(userAchievement);
    }

    public List<UserAchievement> getUserAchievements(User user) {
        return userAchievementRepository.findByUser(user);
    }

    // Example: Call this after user creates a quiz
    public void checkAuthorAchievements(User user, long quizCount) {
        if (quizCount >= 1) awardAchievement(user, "AMATEUR_AUTHOR");
        if (quizCount >= 5) awardAchievement(user, "PROLIFIC_AUTHOR");
        if (quizCount >= 10) awardAchievement(user, "PRODIGIOUS_AUTHOR");
    }

    // Example: Call this after user takes a quiz
    public void checkQuizTakerAchievements(User user, long takenCount, boolean practiceMode) {
        if (takenCount >= 10) awardAchievement(user, "QUIZ_MACHINE");
        if (practiceMode) awardAchievement(user, "PRACTICE_MAKES_PERFECT");
    }

    // Example: Call this after user gets highest score
    public void awardGreatestAchievement(User user) {
        awardAchievement(user, "I_AM_THE_GREATEST");
    }
} 