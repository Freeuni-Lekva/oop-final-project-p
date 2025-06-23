package com.quizapp.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String questionText;
    private String type; // question-response fill-in-blank multiple-choice picture-response
    private String imageUrl;
    private Integer questionOrder;

    @ElementCollection
    @CollectionTable(name = "question_choices", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "choice")
    private List<String> choices; // for multi choice

    @ElementCollection
    @CollectionTable(name = "question_correct_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "correct_answer")
    private List<String> correctAnswers; // multi correct answers

    private Boolean orderMatters; // Order based multi answrs

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    // Constructors
    public Question() {}

    public Question(String questionText, String type, List<String> correctAnswers) {
        this.questionText = questionText;
        this.type = type;
        this.correctAnswers = correctAnswers;
        this.orderMatters = false;
    }

    public Question(String questionText, String type, List<String> choices, List<String> correctAnswers) {
        this.questionText = questionText;
        this.type = type;
        this.choices = choices;
        this.correctAnswers = correctAnswers;
        this.orderMatters = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }

    public List<String> getChoices() {
        return choices;
    }

    public void setChoices(List<String> choices) {
        this.choices = choices;
    }

    public List<String> getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(List<String> correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Boolean getOrderMatters() {
        return orderMatters;
    }

    public void setOrderMatters(Boolean orderMatters) {
        this.orderMatters = orderMatters;
    }

    public Quiz getQuiz() {
        return quiz;
    }

    public void setQuiz(Quiz quiz) {
        this.quiz = quiz;
    }

    // check if answer is correct
    public boolean isAnswerCorrect(String userAnswer) {
        if (correctAnswers == null || correctAnswers.isEmpty()) {
            return false;
        }

        String normalizedUserAnswer = userAnswer.trim().toLowerCase();

        for (String correctAnswer : correctAnswers) {
            if (correctAnswer.trim().toLowerCase().equals(normalizedUserAnswer)) {
                return true;
            }
        }
        return false;
    }

    // Helper for multi-answer questions
    public boolean areAnswersCorrect(List<String> userAnswers) {
        if (correctAnswers == null || userAnswers == null) {
            return false;
        }

        if (userAnswers.size() != correctAnswers.size()) {
            return false;
        }

        if (orderMatters) {
            // Check answers in order
            for (int i = 0; i < userAnswers.size(); i++) {
                if (!isAnswerCorrect(userAnswers.get(i))) {
                    return false;
                }
            }
        } else {
            // Check if all correct answers are there
            List<String> normalizedUserAnswers = userAnswers.stream()
                    .map(answer -> answer.trim().toLowerCase())
                    .toList();

            List<String> normalizedCorrectAnswers = correctAnswers.stream()
                    .map(answer -> answer.trim().toLowerCase())
                    .toList();

            return normalizedUserAnswers.containsAll(normalizedCorrectAnswers) &&
                    normalizedCorrectAnswers.containsAll(normalizedUserAnswers);
        }

        return true;
    }
}