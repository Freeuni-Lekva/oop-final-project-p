package com.quizapp.service;

import com.quizapp.model.Answer;
import com.quizapp.model.Question;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizGradingService {

    // Grade a single answer
    public boolean gradeAnswer(Question question, String userAnswer) {
        if (userAnswer == null || userAnswer.trim().isEmpty()) {
            return false;
        }
        return question.isAnswerCorrect(userAnswer);
    }

    // Grade multiple answers for a single question (for multi-answer questions)
    public boolean gradeMultiAnswerQuestion(Question question, List<String> userAnswers) {
        if (userAnswers == null || userAnswers.isEmpty()) {
            return false;
        }
        return question.areAnswersCorrect(userAnswers);
    }

    // Grade whole quiz
    public QuizGradingResult gradeQuiz(List<Answer> answers) {
        QuizGradingResult result = new QuizGradingResult();
        int totalQuestions = answers.size();
        int correctAnswers = 0;
        double totalScore = 0.0;
        for (Answer answer : answers) {
            Question question = answer.getQuestion();
            boolean isCorrect = gradeAnswer(question, answer.getUserAnswer());
            answer.setIsCorrect(isCorrect);
            if (isCorrect) {
                correctAnswers++;
                totalScore += 1.0;
            }
        }
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correctAnswers);
        result.setScore(totalScore);
        result.setPercentage((totalScore / totalQuestions) * 100);
        result.setGradedAnswers(answers);
        return result;
    }

    public static class QuizGradingResult {
        private int totalQuestions;
        private int correctAnswers;
        private double score;
        private double percentage;
        private List<Answer> gradedAnswers;
        public int getTotalQuestions() { return totalQuestions; }
        public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }
        public int getCorrectAnswers() { return correctAnswers; }
        public void setCorrectAnswers(int correctAnswers) { this.correctAnswers = correctAnswers; }
        public double getScore() { return score; }
        public void setScore(double score) { this.score = score; }
        public double getPercentage() { return percentage; }
        public void setPercentage(double percentage) { this.percentage = percentage; }
        public List<Answer> getGradedAnswers() { return gradedAnswers; }
        public void setGradedAnswers(List<Answer> gradedAnswers) { this.gradedAnswers = gradedAnswers; }
    }
}