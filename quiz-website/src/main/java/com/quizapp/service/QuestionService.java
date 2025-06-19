package com.quizapp.service;

import com.quizapp.model.Question;
import com.quizapp.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Autowired
    public QuestionService(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    // Get all questions (possibly filter by quizId later)
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    // Get a question by ID
    public Optional<Question> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    // Create a new question
    @Transactional
    public Question createQuestion(Question question) {
        // Add validation logic here, e.g., ensure associated quiz exists
        return questionRepository.save(question);
    }

    // Update a question
    @Transactional
    public Optional<Question> updateQuestion(Long id, Question updatedQuestionData) {
        return questionRepository.findById(id).map(question -> {
            question.setQuestionText(updatedQuestionData.getQuestionText()); // Assuming 'questionText' field
            // Update other properties like answers, type, etc.
            return questionRepository.save(question);
        });
    }

    // Delete a question
    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    // You might add methods like:
    // List<Question> getQuestionsByQuizId(Long quizId);
}
