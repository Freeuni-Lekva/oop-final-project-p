import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const QUESTION_TYPES = {
  QUESTION_RESPONSE: 'QUESTION_RESPONSE',
  FILL_IN_THE_BLANK: 'FILL_IN_THE_BLANK',
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  PICTURE_RESPONSE: 'PICTURE_RESPONSE',
};

const TakeQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // TODO: Replace with your actual backend endpoint
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) throw new Error('Failed to fetch quiz');
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      // TODO: Adjust endpoint if needed
      const response = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to submit quiz');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, idx) => {
    switch (question.type) {
      case QUESTION_TYPES.QUESTION_RESPONSE:
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.text}</label>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
            />
          </div>
        );
      case QUESTION_TYPES.FILL_IN_THE_BLANK:
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.text}</label>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
            />
          </div>
        );
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.text}</label>
            <div>
              {question.options.map((option, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`mc_${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleChange(question.id, option)}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        );
      case QUESTION_TYPES.PICTURE_RESPONSE:
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.text}</label>
            <div>
              <img src={question.imageUrl} alt="Question" style={{ maxWidth: '300px', display: 'block', margin: '10px 0' }} />
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleChange(question.id, e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quiz) return <div>No quiz found.</div>;

  if (result) {
    return (
      <div className="quiz-result-container">
        <h2>Quiz Results</h2>
        <p><strong>Score:</strong> {result.score}</p>
        <p><strong>Time Taken:</strong> {result.timeTaken} seconds</p>
        {/* Optionally show more details, e.g. correct answers, user answers, etc. */}
        {result.details && (
          <div>
            <h3>Details</h3>
            <ul>
              {result.details.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="take-quiz-container">
      <h2>{quiz.title}</h2>
      <p>{quiz.description}</p>
      <form onSubmit={handleSubmit}>
        {quiz.questions && quiz.questions.map((q, idx) => renderQuestion(q, idx))}
        <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Quiz'}</button>
      </form>
    </div>
  );
};

export default TakeQuiz; 