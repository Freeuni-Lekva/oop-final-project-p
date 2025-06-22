package com.quizapp.service;

import com.quizapp.model.Answer;
import com.quizapp.model.Question;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class QuizGradingService {

    // Grade a single answer
    public boolean gradeAnswer(Question question, String userAnswer) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return false;
        }

        switch (question.getType().toLowerCase()) {
            case "question-response":
            case "fill-in-blank":
            case "picture-response":
                return gradeTextAnswer(question, userAnswer);
            case "multiple-choice":
                return gradeMultipleChoiceAnswer(question, userAnswer);
            case "multi-answer":
                return gradeTextAnswer(question, userAnswer);
            default:
                return gradeTextAnswer(question, userAnswer);
        }
    }

    // Grade multiple answers for a single question (for multi-answer questions)
    public boolean gradeMultiAnswerQuestion(Question question, List<String> userAnswers) {
        if (userAnswers == null || userAnswers.isEmpty()) {
            return false;
        }

        return question.areAnswersCorrect(userAnswers);
    }

    //Grade text-based answers (question-response, fill-in-blank, picture-response)
    private boolean gradeTextAnswer(Question question, String userAnswer) {
        return question.isAnswerCorrect(userAnswer);
    }


     // Grade multiple choice answers
    private boolean gradeMultipleChoiceAnswer(Question question, String userAnswer) {
        return question.isAnswerCorrect(userAnswer);
    }


    // Find percentage for multi answer
    public double calculatePartialCredit(Question question, List<String> userAnswers) {
        if (userAnswers == null || question.getCorrectAnswers() == null) {
            return 0.0;
        }

        int correctCount = 0;
        int totalRequired = question.getCorrectAnswers().size();

        if (question.getOrderMatters()) {
            for (int i = 0; i < Math.min(userAnswers.size(), totalRequired); i++) {
                if (question.isAnswerCorrect(userAnswers.get(i))) {
                    correctCount++;
                }
            }
        } else {
            for (String userAnswer : userAnswers) {
                if (question.isAnswerCorrect(userAnswer)) {
                    correctCount++;
                }
            }
        }

        return (double) correctCount / totalRequired;
    }


    // Grade whole quiz
    public QuizGradingResult gradeQuiz(List<Answer> answers) {
        QuizGradingResult result = new QuizGradingResult();

        int totalQuestions = answers.size();
        int correctAnswers = 0;
        double totalScore = 0.0;

        for (Answer answer : answers) {
            Question question = answer.getQuestion();
            boolean isCorrect = gradeAnswer(question, answer.getSelectedAnswer());

            answer.setIsCorrect(isCorrect);

            if (isCorrect) {
                correctAnswers++;
                totalScore += 1.0;
            } else if ("multi-answer".equals(question.getType().toLowerCase())) {
                // rogor vapaseb egetebs bro
            }
        }

        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correctAnswers);
        result.setScore(totalScore);
        result.setPercentage((totalScore / totalQuestions) * 100);
        result.setGradedAnswers(answers);

        return result;
    }


    // validate
    public boolean validateAnswerFormat(Question question, String userAnswer) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return false;
        }

        switch (question.getType().toLowerCase()) {
            case "multiple-choice":
                return validateMultipleChoiceAnswer(question, userAnswer);
            case "question-response":
            case "fill-in-blank":
            case "picture-response":
                return validateTextAnswer(userAnswer);
            default:
                return true; // Default to accepting any format
        }
    }

    // multi choice
    private boolean validateMultipleChoiceAnswer(Question question, String userAnswer) {
        if (question.getChoices() == null || question.getChoices().isEmpty()) {
            return false;
        }
        return question.getChoices().contains(userAnswer);
    }


    // anwer format
    private boolean validateTextAnswer(String userAnswer) {
        // Basic validation - ensure answer is not too long and contains valid characters
        return userAnswer.length() <= 1000 && userAnswer.matches("^[\\w\\s\\-.,!?;:'\"()]+$");
    }


    public static class QuizGradingResult {
        private int totalQuestions;
        private int correctAnswers;
        private double score;
        private double percentage;
        private List<Answer> gradedAnswers;

        public int getTotalQuestions() {
            return totalQuestions;
        }

        public void setTotalQuestions(int totalQuestions) {
            this.totalQuestions = totalQuestions;
        }

        public int getCorrectAnswers() {
            return correctAnswers;
        }

        public void setCorrectAnswers(int correctAnswers) {
            this.correctAnswers = correctAnswers;
        }

        public double getScore() {
            return score;
        }

        public void setScore(double score) {
            this.score = score;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }

        public List<Answer> getGradedAnswers() {
            return gradedAnswers;
        }

        public void setGradedAnswers(List<Answer> gradedAnswers) {
            this.gradedAnswers = gradedAnswers;
        }
    }
}