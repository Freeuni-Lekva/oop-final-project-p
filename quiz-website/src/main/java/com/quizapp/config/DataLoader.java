package com.quizapp.config;

import com.quizapp.model.*;
import com.quizapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        if (quizRepository.count() == 0) {
            loadSampleData();
        }
    }

    private void loadSampleData() {
        User user1 = new User();
        user1.setUsername("john_doe");
        user1.setPasswordHash("hashed_password_1");
        userRepository.save(user1);

        User user2 = new User();
        user2.setUsername("jane_smith");
        user2.setPasswordHash("hashed_password_2");
        userRepository.save(user2);

        createMathQuiz();
        createHistoryQuiz();
        createGeographyQuiz();
    }

    private void createMathQuiz() {
        Quiz mathQuiz = new Quiz();
        mathQuiz.setTitle("Basic Mathematics Quiz");
        mathQuiz.setDescription("Test your knowledge of basic mathematics including arithmetic, algebra, and geometry.");
        quizRepository.save(mathQuiz);

        // Addition
        Question q1 = new Question();
        q1.setQuestionText("What is 15 + 27?");
        q1.setType("question-response");
        q1.setCorrectAnswers(Arrays.asList("42", "forty-two"));
        q1.setQuestionOrder(1);
        q1.setQuiz(mathQuiz);
        questionRepository.save(q1);

        // Multiplication
        Question q2 = new Question();
        q2.setQuestionText("What is 8 × 7?");
        q2.setType("question-response");
        q2.setCorrectAnswers(Arrays.asList("56", "fifty-six"));
        q2.setQuestionOrder(2);
        q2.setQuiz(mathQuiz);
        questionRepository.save(q2);

        // Multiple Choice
        Question q3 = new Question();
        q3.setQuestionText("What is the square root of 16?");
        q3.setType("multiple-choice");
        q3.setChoices(Arrays.asList("2", "4", "8", "16"));
        q3.setCorrectAnswers(Arrays.asList("4"));
        q3.setQuestionOrder(3);
        q3.setQuiz(mathQuiz);
        questionRepository.save(q3);

        // Fill in the blank
        Question q4 = new Question();
        q4.setQuestionText("The formula for the area of a circle is π × __________ squared.");
        q4.setType("fill-in-blank");
        q4.setCorrectAnswers(Arrays.asList("radius", "r"));
        q4.setQuestionOrder(4);
        q4.setQuiz(mathQuiz);
        questionRepository.save(q4);

        //Picture response
        Question q5 = new Question();
        q5.setQuestionText("What geometric shape is shown in this image?");
        q5.setType("picture-response");
        q5.setImageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Regular_polygon_6_annotated.svg/200px-Regular_polygon_6_annotated.svg.png");
        q5.setCorrectAnswers(Arrays.asList("hexagon", "regular hexagon", "6-sided polygon"));
        q5.setQuestionOrder(5);
        q5.setQuiz(mathQuiz);
        questionRepository.save(q5);
    }

    private void createHistoryQuiz() {
        Quiz historyQuiz = new Quiz();
        historyQuiz.setTitle("World History Quiz");
        historyQuiz.setDescription("Test your knowledge of important historical events and figures.");
        quizRepository.save(historyQuiz);

        //Multiple Choice
        Question q1 = new Question();
        q1.setQuestionText("In which year did World War II end?");
        q1.setType("multiple-choice");
        q1.setChoices(Arrays.asList("1943", "1944", "1945", "1946"));
        q1.setCorrectAnswers(Arrays.asList("1945"));
        q1.setQuestionOrder(1);
        q1.setQuiz(historyQuiz);
        questionRepository.save(q1);

        // Question Response
        Question q2 = new Question();
        q2.setQuestionText("Who was the first President of the United States?");
        q2.setType("question-response");
        q2.setCorrectAnswers(Arrays.asList("George Washington", "Washington"));
        q2.setQuestionOrder(2);
        q2.setQuiz(historyQuiz);
        questionRepository.save(q2);

        //Fill in the blank
        Question q3 = new Question();
        q3.setQuestionText("The __________ Revolution began in 1789.");
        q3.setType("fill-in-blank");
        q3.setCorrectAnswers(Arrays.asList("French", "France"));
        q3.setQuestionOrder(3);
        q3.setQuiz(historyQuiz);
        questionRepository.save(q3);

        //Picture Responce
        Question q4 = new Question();
        q4.setQuestionText("Which famous landmark is shown in this image?");
        q4.setType("picture-response");
        q4.setImageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Eiffel_Tower_from_the_Champ_de_Mars%2C_Paris_May_2008.jpg/200px-Eiffel_Tower_from_the_Champ_de_Mars%2C_Paris_May_2008.jpg");
        q4.setCorrectAnswers(Arrays.asList("Eiffel Tower", "Tour Eiffel"));
        q4.setQuestionOrder(4);
        q4.setQuiz(historyQuiz);
        questionRepository.save(q4);
    }

    private void createGeographyQuiz() {
        Quiz geoQuiz = new Quiz();
        geoQuiz.setTitle("Geography Quiz");
        geoQuiz.setDescription("Test your knowledge of world geography, countries, and capitals.");
        quizRepository.save(geoQuiz);

        //Multiple Choice
        Question q1 = new Question();
        q1.setQuestionText("What is the capital of Japan?");
        q1.setType("multiple-choice");
        q1.setChoices(Arrays.asList("Tokyo", "Kyoto", "Osaka", "Yokohama"));
        q1.setCorrectAnswers(Arrays.asList("Tokyo"));
        q1.setQuestionOrder(1);
        q1.setQuiz(geoQuiz);
        questionRepository.save(q1);

        // Question Response
        Question q2 = new Question();
        q2.setQuestionText("What is the largest continent by area?");
        q2.setType("question-response");
        q2.setCorrectAnswers(Arrays.asList("Asia"));
        q2.setQuestionOrder(2);
        q2.setQuiz(geoQuiz);
        questionRepository.save(q2);

        // Fill in the blank
        Question q3 = new Question();
        q3.setQuestionText("The __________ River is the longest river in the world.");
        q3.setType("fill-in-blank");
        q3.setCorrectAnswers(Arrays.asList("Nile"));
        q3.setQuestionOrder(3);
        q3.setQuiz(geoQuiz);
        questionRepository.save(q3);

        // Picture Response
        Question q4 = new Question();
        q4.setQuestionText("Which country's flag is shown in this image?");
        q4.setType("picture-response");
        q4.setImageUrl("https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/200px-Flag_of_Japan.svg.png");
        q4.setCorrectAnswers(Arrays.asList("Japan", "Japanese"));
        q4.setQuestionOrder(4);
        q4.setQuiz(geoQuiz);
        questionRepository.save(q4);

        //Multi-answer
        Question q5 = new Question();
        q5.setQuestionText("Name three countries in South America.");
        q5.setType("multi-answer");
        q5.setCorrectAnswers(Arrays.asList("Brazil", "Argentina", "Chile"));
        q5.setOrderMatters(false);
        q5.setQuestionOrder(5);
        q5.setQuiz(geoQuiz);
        questionRepository.save(q5);
    }
}