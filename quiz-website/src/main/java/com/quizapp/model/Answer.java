package com.quizapp.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.Id;

@Entity
public class Answer {


    @jakarta.persistence.Id
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String selectedAnswer;

    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question;

    private String userId; // optional, for tracking who submitted

    // Constructors
    public Answer() {}

    public Answer(Question question, String selectedAnswer, String userId) {
        this.question = question;
        this.selectedAnswer = selectedAnswer;
        this.userId = userId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public String getSelectedAnswer() {
        return selectedAnswer;
    }

    public void setSelectedAnswer(String selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public Question getQuestion() {
        return question;
    }

    public void setQuestion(Question question) {
        this.question = question;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setId(Long id) {
        this.id = id;
    }


}
