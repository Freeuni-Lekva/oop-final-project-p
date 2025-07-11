package com.quizapp.dto;

import java.time.LocalDateTime;

public class QuizHistoryItemDTO {
    private String quizTitle;
    private int score;
    private int totalQuestions;
    private double percentage;
    private LocalDateTime endTime;

    public QuizHistoryItemDTO() {}

    public QuizHistoryItemDTO(String quizTitle, int score, int totalQuestions, double percentage, LocalDateTime endTime) {
        this.quizTitle = quizTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.percentage = percentage;
        this.endTime = endTime;
    }

    public String getQuizTitle() { return quizTitle; }
    public void setQuizTitle(String quizTitle) { this.quizTitle = quizTitle; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
}