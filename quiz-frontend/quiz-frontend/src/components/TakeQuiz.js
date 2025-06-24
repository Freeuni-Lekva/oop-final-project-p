import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [immediateFeedback, setImmediateFeedback] = useState(null);

  useEffect(() => {
    const startQuiz = async () => {
      try {
        const quizResponse = await fetch(`http://localhost:8081/api/quizzes/${quizId}`, {
          credentials: 'include'
        });
        if (!quizResponse.ok) throw new Error('Failed to fetch quiz');
        const quizData = await quizResponse.json();
        setQuiz(quizData);
        const startResponse = await fetch(`http://localhost:8081/api/quiz-taking/start/${quizId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        if (!startResponse.ok) throw new Error('Failed to start quiz');
        const startData = await startResponse.json();
        setAttemptId(startData.attemptId);
        setQuestions(startData.questions || quizData.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    startQuiz();
  }, [quizId]);

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // For multi-page: submit one question for immediate correction
  const handleImmediateNext = async () => {
    setShowImmediateFeedback(false);
    setImmediateFeedback(null);
    const q = questions[currentIdx];
    if (!attemptId || !q) return;
    try {
      const response = await fetch(`http://localhost:8081/api/quiz-taking/check/${attemptId}/${q.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answer: answers[q.id] })
      });
      const data = await response.json();
      setImmediateFeedback(data.correct ? 'Correct!' : 'Incorrect.');
      setShowImmediateFeedback(true);
      setTimeout(() => {
        setShowImmediateFeedback(false);
        setImmediateFeedback(null);
        setCurrentIdx((idx) => idx + 1);
      }, 1200);
    } catch (err) {
      setImmediateFeedback('Error checking answer');
      setShowImmediateFeedback(true);
    }
  };

  const handleNext = () => {
    setCurrentIdx((idx) => idx + 1);
  };
  const handlePrev = () => {
    setCurrentIdx((idx) => idx - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!attemptId) {
      setError('No active quiz attempt found');
      return;
    }
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch(`http://localhost:8081/api/quiz-taking/submit/${attemptId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(answers),
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
      case 'QUESTION_RESPONSE':
      case 'FILL_IN_THE_BLANK':
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.questionText}</label>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
            />
          </div>
        );
      case 'MULTIPLE_CHOICE':
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.questionText}</label>
            <div>
              {question.options && question.options.map((option, i) => (
                <label key={i}>
                  <input
                    type="radio"
                    name={`mc_${question.id}`}
                    value={option.text}
                    checked={answers[question.id] === option.text}
                    onChange={() => handleChange(question.id, option.text)}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        );
      case 'PICTURE_RESPONSE':
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.questionText}</label>
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
        return (
          <div key={question.id} className="question-block">
            <label>{idx + 1}. {question.questionText} (Type: {question.type})</label>
            <input
              type="text"
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
            />
          </div>
        );
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!quiz) return <div>No quiz found.</div>;

  if (result) {
    return (
      <div className="quiz-result-container">
        <h2>Quiz Results</h2>
        <p><strong>Score:</strong> {result.score}/{result.totalQuestions}</p>
        <p><strong>Percentage:</strong> {result.percentage}%</p>
        <p><strong>Time Taken:</strong> {result.timeTaken} minutes</p>
        <p><strong>Completed:</strong> {result.completed ? 'Yes' : 'No'}</p>
      </div>
    );
  }

  // Multi-page logic
  if (quiz.singlePage) {
    // Show all questions at once (default behavior)
    return (
      <div className="take-quiz-container">
        <h2>{quiz.title}</h2>
        <p>{quiz.description}</p>
        <form onSubmit={handleSubmit}>
          {questions && questions.map((q, idx) => renderQuestion(q, idx))}
          <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Quiz'}</button>
        </form>
      </div>
    );
  } else {
    // Multi-page: show one question at a time
    const q = questions[currentIdx];
    return (
      <div className="take-quiz-container">
        <h2>{quiz.title}</h2>
        <p>{quiz.description}</p>
        <form onSubmit={handleSubmit}>
          {q && renderQuestion(q, currentIdx)}
          <div style={{ marginTop: 20 }}>
            <button type="button" onClick={handlePrev} disabled={currentIdx === 0}>Previous</button>
            {quiz.immediateCorrection ? (
              <button
                type="button"
                onClick={handleImmediateNext}
                disabled={!answers[q.id] || showImmediateFeedback || currentIdx === questions.length - 1}
              >
                {currentIdx === questions.length - 1 ? 'Finish' : 'Next'}
              </button>
            ) : (
              <button
                type={currentIdx === questions.length - 1 ? 'submit' : 'button'}
                onClick={currentIdx === questions.length - 1 ? undefined : handleNext}
                disabled={!answers[q.id]}
              >
                {currentIdx === questions.length - 1 ? (submitting ? 'Submitting...' : 'Submit Quiz') : 'Next'}
              </button>
            )}
          </div>
          {quiz.immediateCorrection && showImmediateFeedback && (
            <div style={{ color: 'green', marginTop: 10 }}>{immediateFeedback}</div>
          )}
        </form>
      </div>
    );
  }
};

export default TakeQuiz; 