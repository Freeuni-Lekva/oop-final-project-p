package com.quizapp.dto;

import java.util.Map;

public class QuizSubmissionDto {
    private Long attemptId;
    private Map<Long, String> questionAnswers;
    private Long userId;
    private Long quizId;

    // Constructors
    public QuizSubmissionDto() {}

    public QuizSubmissionDto(Long attemptId, Map<Long, String> questionAnswers, Long userId, Long quizId) {
        this.attemptId = attemptId;
        this.questionAnswers = questionAnswers;
        this.userId = userId;
        this.quizId = quizId;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Map<Long, String> getQuestionAnswers() {
        return questionAnswers;
    }

    public void setQuestionAnswers(Map<Long, String> questionAnswers) {
        this.questionAnswers = questionAnswers;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }
}