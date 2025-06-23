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

    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    public Optional<Question> getQuestionById(Long id) {
        return questionRepository.findById(id);
    }

    @Transactional
    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }

    @Transactional
    public Optional<Question> updateQuestion(Long id, Question updatedQuestionData) {
        return questionRepository.findById(id).map(question -> {
            question.setQuestionText(updatedQuestionData.getQuestionText());
            // Update other properties like answers, type, etc.
            return questionRepository.save(question);
        });
    }

    @Transactional
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    // List<Question> getQuestionsByQuizId(Long quizId);
}