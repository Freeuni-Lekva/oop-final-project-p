package com.quizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "answers")
@Getter
@Setter
@NoArgsConstructor
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne
    @JoinColumn(name = "quiz_attempt_id", nullable = false)
    @JsonIgnore
    private QuizAttempt quizAttempt;

    @ManyToOne
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnore
    private Question question;

    private String userAnswer;
    private Boolean isCorrect;
    private Integer questionNumber;

    public Answer(User user, QuizAttempt quizAttempt, Question question, String userAnswer, Boolean isCorrect, Integer questionNumber) {
        this.user = user;
        this.quizAttempt = quizAttempt;
        this.question = question;
        this.userAnswer = userAnswer;
        this.isCorrect = isCorrect;
        this.questionNumber = questionNumber;
    }
}