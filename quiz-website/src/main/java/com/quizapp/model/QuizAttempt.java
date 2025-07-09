package com.quizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.Duration; // Make sure to import Duration

@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    @JsonIgnore
    private Quiz quiz;

    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private Boolean isCompleted;
    private Boolean isPracticeMode;

    private Long timeTakenMinutes;

    // Constructors
    public QuizAttempt() {}

    public QuizAttempt(User user, Quiz quiz) {
        this.user = user;
        this.quiz = quiz;
        this.startTime = LocalDateTime.now();
        this.isCompleted = false;
        this.isPracticeMode = false;
        this.totalQuestions = quiz.getQuestions().size();
        this.timeTakenMinutes = null;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Boolean getIsCompleted() {
        return isCompleted;
    }

    public void setIsCompleted(Boolean completed) {
        isCompleted = completed;
    }

    public Boolean getIsPracticeMode() {
        return isPracticeMode;
    }

    public void setIsPracticeMode(Boolean practiceMode) {
        isPracticeMode = practiceMode;
    }

    public Long getTimeTakenMinutes() {
        return timeTakenMinutes;
    }

    public void setTimeTakenMinutes(Long timeTakenMinutes) {
        this.timeTakenMinutes = timeTakenMinutes;
    }

    public void completeAttempt(Integer score) {
        this.score = score;
        this.endTime = LocalDateTime.now();
        this.isCompleted = true;
        this.percentage = (double) score / totalQuestions * 100;

        if (this.startTime != null && this.endTime != null) {
            this.timeTakenMinutes = Duration.between(this.startTime, this.endTime).toMinutes();
        } else {
            this.timeTakenMinutes = null; // if start-end time are missing
        }
    }
}