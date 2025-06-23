package com.quizapp.service;

import com.quizapp.model.Quiz;
import com.quizapp.repository.QuestionRepository;
import com.quizapp.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;

    // Constructor
    @Autowired
    public QuizService(QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }


    // Get all quizzes
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Optional<Quiz> getQuizById(Long id) {
        return quizRepository.findById(id);
    }

    @Transactional
    public Quiz createQuiz(Quiz quiz) {
        // validate
        return quizRepository.save(quiz);
    }

    @Transactional
    public Optional<Quiz> updateQuiz(Long id, Quiz updatedQuizData) {
        return quizRepository.findById(id).map(quiz -> {
            quiz.setTitle(updatedQuizData.getTitle());
            quiz.setQuestions(updatedQuizData.getQuestions());
            return quizRepository.save(quiz);
        });
    }

    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }


    // public Quiz addQuestionsToQuiz(Long quizId, List<Question> newQuestions) {
    //     Optional<Quiz> quizOptional = quizRepository.findById(quizId);
    //     if (quizOptional.isPresent()) {
    //         Quiz quiz = quizOptional.get();
    //         newQuestions.forEach(q -> {
    //             q.setQuiz(quiz);
    //             questionRepository.save(q);
    //         });
    //         return quiz;
    //     }
    //     return null;
    // }
}