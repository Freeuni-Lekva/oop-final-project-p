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
    private final QuestionRepository questionRepository; // Assuming you might link questions to quizzes

    // Constructor injection is preferred over field injection for @Autowired
    @Autowired
    public QuizService(QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    // --- Quiz Management Methods ---

    // Get all quizzes
    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    // Get a single quiz by ID
    public Optional<Quiz> getQuizById(Long id) {
        return quizRepository.findById(id);
    }

    // Create a new quiz
    @Transactional // Ensures the entire method runs as a single database transaction
    public Quiz createQuiz(Quiz quiz) {
        // You might add validation or additional logic here before saving
        return quizRepository.save(quiz);
    }

    // Update an existing quiz
    @Transactional
    public Optional<Quiz> updateQuiz(Long id, Quiz updatedQuizData) {
        return quizRepository.findById(id).map(quiz -> {
            quiz.setTitle(updatedQuizData.getTitle());
            quiz.setQuestions(updatedQuizData.getQuestions());
            // Update other properties as needed
            return quizRepository.save(quiz);
        });
    }

    // Delete a quiz
    @Transactional
    public void deleteQuiz(Long id) {
        quizRepository.deleteById(id);
    }

    // --- Methods involving Quiz and Questions (Example) ---
    // If a quiz has a list of questions, you might add a method like this:
    // public Quiz addQuestionsToQuiz(Long quizId, List<Question> newQuestions) {
    //     Optional<Quiz> quizOptional = quizRepository.findById(quizId);
    //     if (quizOptional.isPresent()) {
    //         Quiz quiz = quizOptional.get();
    //         newQuestions.forEach(q -> {
    //             q.setQuiz(quiz); // Assuming Question has a ManyToOne relationship back to Quiz
    //             questionRepository.save(q);
    //         });
    //         return quiz;
    //     }
    //     return null; // Or throw an exception
    // }
}
