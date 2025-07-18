package com.quizapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String questionText;

    @Enumerated(EnumType.STRING)
    private QuestionType type;

    private String imageUrl;

    private Integer questionOrder;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "question_id")
    private List<Option> options;

    @ElementCollection
    @CollectionTable(name = "question_correct_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "correct_answer")
    private List<String> correctAnswers;

    private Boolean orderMatters = false;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    @JsonIgnore
    private Quiz quiz;

    public enum QuestionType {
        QUESTION_RESPONSE, FILL_IN_THE_BLANK, MULTIPLE_CHOICE, PICTURE_RESPONSE
    }

    public Question(String questionText, QuestionType type, List<Option> options, List<String> correctAnswers) {
        this.questionText = questionText;
        this.type = type;
        this.options = options;
        this.correctAnswers = correctAnswers;
    }

    @PrePersist
    @PreUpdate
    private void validate() {
        if (type == QuestionType.MULTIPLE_CHOICE) {
            if (options == null || options.size() < 2) {
                throw new IllegalStateException("Multiple-choice question must have at least two options");
            }
            long correctCount = options.stream().filter(Option::getIsCorrect).count();
            if (correctCount != 1) {
                throw new IllegalStateException("Multiple-choice question must have exactly one correct option");
            }
        } else {
            if (correctAnswers == null || correctAnswers.isEmpty() || correctAnswers.stream().noneMatch(ans -> ans != null && !ans.trim().isEmpty())) {
                throw new IllegalStateException("Non-multiple-choice question must have at least one valid correct answer");
            }
        }
        if (type == QuestionType.PICTURE_RESPONSE && (imageUrl == null || !imageUrl.matches("^(http|https)://.*$"))) {
            throw new IllegalStateException("Picture-response question must have a valid image URL");
        }
        if (type == QuestionType.FILL_IN_THE_BLANK && (questionText == null || !questionText.contains("____"))) {
            throw new IllegalStateException("Fill-in-the-blank question must contain '____' in the question text");
        }
    }

    public boolean isAnswerCorrect(String userAnswer) {
        if (type == QuestionType.MULTIPLE_CHOICE) {
            return options.stream()
                    .filter(Option::getIsCorrect)
                    .map(Option::getText)
                    .anyMatch(ans -> ans.trim().toLowerCase().equals(userAnswer.trim().toLowerCase()));
        }
        if (correctAnswers == null || correctAnswers.isEmpty()) return false;
        String normalized = userAnswer.trim().toLowerCase();
        return correctAnswers.stream()
                .map(ans -> ans.trim().toLowerCase())
                .anyMatch(ans -> ans.equals(normalized));
    }

    public boolean areAnswersCorrect(List<String> userAnswers) {
        if (correctAnswers == null || userAnswers == null) {
            return false;
        }
        if (userAnswers.size() != correctAnswers.size()) {
            return false;
        }
        if (Boolean.TRUE.equals(orderMatters)) {
            for (int i = 0; i < userAnswers.size(); i++) {
                String userAns = userAnswers.get(i) == null ? "" : userAnswers.get(i).trim().toLowerCase();
                String correctAns = correctAnswers.get(i) == null ? "" : correctAnswers.get(i).trim().toLowerCase();
                if (!userAns.equals(correctAns)) {
                    return false;
                }
            }
            return true;
        } else {
            List<String> normalizedUser = userAnswers.stream().map(a -> a == null ? "" : a.trim().toLowerCase()).collect(Collectors.toList());
            List<String> normalizedCorrect = correctAnswers.stream().map(a -> a == null ? "" : a.trim().toLowerCase()).collect(Collectors.toList());
            return normalizedUser.containsAll(normalizedCorrect) && normalizedCorrect.containsAll(normalizedUser);
        }
    }
}