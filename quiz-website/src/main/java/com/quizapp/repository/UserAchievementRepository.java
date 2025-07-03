package com.quizapp.repository;

import com.quizapp.model.UserAchievement;
import com.quizapp.model.User;
import com.quizapp.model.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAchievementRepository extends JpaRepository<UserAchievement, Long> {
    List<UserAchievement> findByUser(User user);
    boolean existsByUserAndAchievement(User user, Achievement achievement);
} 