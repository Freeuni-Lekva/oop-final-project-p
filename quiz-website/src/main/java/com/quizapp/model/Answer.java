package com.quizapp.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.Id;

@Entity
@Table(name = "answers")
public class Answer {

    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String selectedAnswer;
    private Boolean isCorrect;
    private Integer questionNumber;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    @ManyToOne
    @JoinColumn(name = "quiz_attempt_id")
    private QuizAttempt quizAttempt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // Constructors
    public Answer() {}

    public Answer(Question question, String selectedAnswer, User user, QuizAttempt quizAttempt, Integer questionNumber) {
        this.question = question;
        this.selectedAnswer = selectedAnswer;
        this.user = user;
        this.quizAttempt = quizAttempt;
        this.questionNumber = questionNumber;
        this.isCorrect = false; // Will be set during grading
    }



    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
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

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public QuizAttempt getQuizAttempt() {
        return quizAttempt;
    }

    public void setQuizAttempt(QuizAttempt quizAttempt) {
        this.quizAttempt = quizAttempt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getId() {
        return id;
    }
}