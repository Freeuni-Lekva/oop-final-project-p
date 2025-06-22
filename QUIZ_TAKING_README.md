# Quiz Taking and Grading System

This document describes the quiz-taking and grading functionality implemented for the CS108 Quiz Website project.

## Overview

The quiz-taking system allows users to:
- Start new quiz attempts
- Submit answers for grading
- View detailed results and feedback
- Track their quiz history
- Compare scores with other users
- Resume incomplete attempts

## Core Components

### Models

#### QuizAttempt
- Tracks when a user starts and completes a quiz
- Stores score, time taken, and completion status
- Supports practice mode vs. regular mode
- Links to user and quiz entities

#### Answer (Enhanced)
- Stores user responses to individual questions
- Tracks correctness and question order
- Links to quiz attempt and question
- Supports multiple answer formats

#### Question (Enhanced)
- Supports multiple question types (question-response, fill-in-blank, multiple-choice, picture-response)
- Handles multiple correct answers
- Supports order-sensitive multi-answer questions
- Includes image URLs for picture-response questions

### Services

#### QuizTakingService
Main service handling quiz-taking operations:

- `startQuiz(Long quizId, User user, boolean isPracticeMode)` - Start a new quiz attempt
- `submitQuiz(Long attemptId, Map<Long, String> questionAnswers)` - Submit and grade answers
- `getQuizResults(Long attemptId)` - Get detailed results
- `getTopScores(Long quizId, int limit)` - Get leaderboard
- `getUserHistory(Long userId)` - Get user's quiz history
- `getQuizStatistics(Long quizId)` - Get quiz performance statistics
- `resumeQuiz(Long attemptId)` - Resume incomplete attempt
- `getQuizQuestions(Long quizId, boolean randomize)` - Get questions with optional randomization

#### QuizGradingService
Specialized service for grading logic:

- `gradeAnswer(Question question, String userAnswer)` - Grade individual answers
- `gradeMultiAnswerQuestion(Question question, List<String> userAnswers)` - Handle multi-answer questions
- `calculatePartialCredit(Question question, List<String> userAnswers)` - Calculate partial credit
- `validateAnswerFormat(Question question, String userAnswer)` - Validate answer format
- `gradeQuiz(List<Answer> answers)` - Grade entire quiz

### Controllers

#### QuizTakingController
REST API endpoints for quiz-taking:

- `POST /api/quiz-taking/start/{quizId}` - Start quiz attempt
- `POST /api/quiz-taking/submit/{attemptId}` - Submit answers
- `GET /api/quiz-taking/results/{attemptId}` - Get results
- `GET /api/quiz-taking/top-scores/{quizId}` - Get leaderboard
- `GET /api/quiz-taking/history/user/{userId}` - Get user history
- `GET /api/quiz-taking/statistics/{quizId}` - Get statistics
- `GET /api/quiz-taking/resume/{attemptId}` - Resume attempt
- `GET /api/quiz-taking/questions/{quizId}` - Get questions

### DTOs

#### QuizSubmissionDto
Data transfer object for quiz submissions:
- `attemptId` - Quiz attempt identifier
- `questionAnswers` - Map of question ID to user answer
- `userId` - User identifier
- `quizId` - Quiz identifier

#### QuizResultDto
Comprehensive result data:
- Quiz and attempt metadata
- Score and timing information
- Detailed answer feedback
- Comparison statistics

## Question Types Supported

### 1. Question-Response
- Standard text questions with text answers
- Example: "Who was the first President of the United States?"
- Supports multiple correct answers (e.g., "Washington", "George Washington")

### 2. Fill-in-Blank
- Questions with blanks that users fill in
- Example: "The capital of France is __________."
- Supports multiple correct answers

### 3. Multiple Choice
- Questions with predefined choices
- Uses radio buttons for selection
- Example: "What is 2 + 2? A) 3 B) 4 C) 5 D) 6"

### 4. Picture-Response
- Questions with images and text answers
- Example: Display image of a bird, ask for species name
- Supports external image URLs

### 5. Multi-Answer (Extension)
- Questions requiring multiple answers
- Supports ordered and unordered responses
- Example: "List the five largest US cities" (order may or may not matter)

## Grading Features

### Automatic Grading
- Immediate grading upon submission
- Case-insensitive text comparison
- Support for multiple correct answers
- Partial credit for multi-answer questions

### Scoring System
- Score based on number of correct answers
- Percentage calculation
- Time tracking for ranking
- Practice mode (scores not recorded)

### Answer Validation
- Format validation based on question type
- Length limits for text answers
- Choice validation for multiple choice
- Required field validation

## User Experience Features

### Quiz Interface
- Clean, responsive design
- Progress tracking
- Timer display
- Question navigation
- Auto-save functionality

### Results Display
- Visual score representation
- Detailed answer review
- Correct/incorrect feedback
- Performance statistics
- Leaderboard comparison

### History and Statistics
- Personal quiz history
- Performance trends
- Quiz statistics
- Top scores leaderboard
- Recent attempts

## Database Schema

### QuizAttempts Table
```sql
CREATE TABLE quiz_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quiz_id BIGINT NOT NULL,
    start_time DATETIME,
    end_time DATETIME,
    score INT,
    total_questions INT,
    percentage DOUBLE,
    is_completed BOOLEAN,
    is_practice_mode BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);
```

### Answers Table
```sql
CREATE TABLE answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    selected_answer TEXT,
    is_correct BOOLEAN,
    question_number INT,
    question_id BIGINT,
    quiz_attempt_id BIGINT,
    user_id BIGINT,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (quiz_attempt_id) REFERENCES quiz_attempts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## API Usage Examples

### Starting a Quiz
```bash
POST /api/quiz-taking/start/1?practiceMode=false
Content-Type: application/json

{
    "id": 1,
    "username": "testuser"
}
```

### Submitting Answers
```bash
POST /api/quiz-taking/submit/1
Content-Type: application/json

{
    "1": "4",
    "2": "Paris",
    "3": "Blue"
}
```

### Getting Results
```bash
GET /api/quiz-taking/results/1
```

## Testing

The system includes comprehensive unit tests covering:
- Quiz starting functionality
- Answer submission and grading
- Question retrieval and randomization
- History and statistics retrieval
- Error handling

Run tests with:
```bash
mvn test
```

## Future Enhancements

### Planned Features
- Real-time quiz taking with WebSocket support
- Advanced question types (matching, ordering)
- Adaptive difficulty based on performance
- Collaborative quiz taking
- Quiz sharing and social features

### Extensions
- Timed individual questions
- Auto-generated questions
- Manual grading interface
- Advanced analytics and reporting
- Mobile-responsive design improvements

## Security Considerations

- Input validation and sanitization
- SQL injection prevention through JPA
- XSS protection in templates
- Session management for quiz attempts
- Access control for quiz results

## Performance Optimizations

- Efficient database queries with proper indexing
- Caching for frequently accessed data
- Pagination for large result sets
- Lazy loading for related entities
- Batch processing for answer submissions 