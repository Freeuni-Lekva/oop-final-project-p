package com.quizapp.dto;

import com.quizapp.model.Answer;
import com.quizapp.model.QuizAttempt;

import java.time.LocalDateTime;
import java.util.List;

public class QuizResultDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private Long userId;
    private String username;
    private Integer score;
    private Integer totalQuestions;
    private Double percentage;
    private Long timeTakenMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean isPracticeMode;
    private List<AnswerResultDto> answers;

    public QuizResultDto() {}

    public QuizResultDto(QuizAttempt attempt, List<Answer> answers) {
        this.attemptId = attempt.getId();
        this.quizId = attempt.getQuiz().getId();
        this.quizTitle = attempt.getQuiz().getTitle();
        this.userId = attempt.getUser().getId();
        this.username = attempt.getUser().getUsername();
        this.score = attempt.getScore();
        this.totalQuestions = attempt.getTotalQuestions();
        this.percentage = attempt.getPercentage();
        this.timeTakenMinutes = attempt.getTimeTakenMinutes();
        this.startTime = attempt.getStartTime();
        this.endTime = attempt.getEndTime();
        this.isPracticeMode = attempt.getIsPracticeMode();

        //answers to DTOs
        this.answers = answers.stream()
                .map(AnswerResultDto::new)
                .toList();
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public Long getTimeTakenMinutes() {
        return timeTakenMinutes;
    }

    public void setTimeTakenMinutes(Long timeTakenMinutes) {
        this.timeTakenMinutes = timeTakenMinutes;
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

    public Boolean getIsPracticeMode() {
        return isPracticeMode;
    }

    public void setIsPracticeMode(Boolean practiceMode) {
        isPracticeMode = practiceMode;
    }

    public List<AnswerResultDto> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerResultDto> answers) {
        this.answers = answers;
    }

    // For single answer results
    public static class AnswerResultDto {
        private Long questionId;
        private String questionText;
        private String questionType;
        private String userAnswer;
        private List<String> correctAnswers;
        private Boolean isCorrect;
        private Integer questionNumber;

        public AnswerResultDto(Answer answer) {
            this.questionId = answer.getQuestion().getId();
            this.questionText = answer.getQuestion().getQuestionText();
            this.questionType = answer.getQuestion().getType();
            this.userAnswer = answer.getSelectedAnswer();
            this.correctAnswers = answer.getQuestion().getCorrectAnswers();
            this.isCorrect = answer.getIsCorrect();
            this.questionNumber = answer.getQuestionNumber();
        }

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public String getQuestionText() {
            return questionText;
        }

        public void setQuestionText(String questionText) {
            this.questionText = questionText;
        }

        public String getQuestionType() {
            return questionType;
        }

        public void setQuestionType(String questionType) {
            this.questionType = questionType;
        }

        public String getUserAnswer() {
            return userAnswer;
        }

        public void setUserAnswer(String userAnswer) {
            this.userAnswer = userAnswer;
        }

        public List<String> getCorrectAnswers() {
            return correctAnswers;
        }

        public void setCorrectAnswers(List<String> correctAnswers) {
            this.correctAnswers = correctAnswers;
        }

        public Boolean getIsCorrect() {
            return isCorrect;
        }

        public void setIsCorrect(Boolean correct) {
            isCorrect = correct;
        }

        public Integer getQuestionNumber() {
            return questionNumber;
        }

        public void setQuestionNumber(Integer questionNumber) {
            this.questionNumber = questionNumber;
        }
    }
}