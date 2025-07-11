import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Quiz.css';

const EditQuiz = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [singlePage, setSinglePage] = useState(true);
    const [immediateCorrection, setImmediateCorrection] = useState(false);
    const [practiceMode, setPracticeMode] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        document.title = "Edit Quiz";
        fetchQuiz();
    }, [quizId]);

    const fetchQuiz = async () => {
        try {
            const response = await fetch(`http://localhost:8081/api/quizzes/${quizId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                if (response.status === 403) {
                    setError('You do not have permission to edit this quiz');
                } else if (response.status === 404) {
                    setError('Quiz not found');
                } else {
                    setError('Failed to load quiz');
                }
                setLoading(false);
                return;
            }

            const quizData = await response.json();
            
            // Check if current user is the creator
            const homeResponse = await fetch('http://localhost:8081/api/home', { 
                credentials: 'include' 
            });
            
            if (homeResponse.ok) {
                const homeData = await homeResponse.json();
                if (homeData.user !== quizData.createdBy) {
                    setError('You can only edit quizzes you created');
                    setLoading(false);
                    return;
                }
            }

            setTitle(quizData.title || '');
            setDescription(quizData.description || '');
            setRandomizeQuestions(quizData.randomizeQuestions || false);
            setSinglePage(quizData.singlePage !== undefined ? quizData.singlePage : true);
            setImmediateCorrection(quizData.immediateCorrection || false);
            setPracticeMode(quizData.practiceMode || false);
            
            // Format questions for editing
            const formattedQuestions = (quizData.questions || []).map(q => ({
                id: q.id,
                questionText: q.questionText || '',
                type: q.type || 'QUESTION_RESPONSE',
                correctAnswers: q.correctAnswers || [''],
                options: q.options || [],
                imageUrl: q.imageUrl || '',
                questionOrder: q.questionOrder || 1
            }));
            
            setQuestions(formattedQuestions);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching quiz:', err);
            setError('Failed to load quiz');
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, {
            questionText: '',
            type: 'QUESTION_RESPONSE',
            correctAnswers: [''],
            options: [],
            imageUrl: '',
            questionOrder: questions.length + 1
        }]);
    };

    const handleRemoveQuestion = (qIdx) => {
        if (questions.length === 1) {
            setMessage('Quiz must have at least one question');
            return;
        }
        setQuestions(questions.filter((_, index) => index !== qIdx));
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = field === 'questionOrder' ? parseInt(value) || 0 : value;
        if (field === 'type' && value === 'MULTIPLE_CHOICE') {
            newQuestions[index].correctAnswers = [];
            newQuestions[index].options = [{ text: '', isCorrect: false }, { text: '', isCorrect: false }];
        } else if (field === 'type') {
            newQuestions[index].options = [];
            newQuestions[index].correctAnswers = [''];
        }
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, field, value) => {
        const newQuestions = [...questions];
        if (field === 'isCorrect' && value) {
            newQuestions[qIndex].options.forEach((opt, idx) => {
                opt.isCorrect = idx === oIndex; // Ensure single correct option
            });
        } else {
            newQuestions[qIndex].options[oIndex][field] = value;
        }
        setQuestions(newQuestions);
    };

    const handleAddOption = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push({ text: '', isCorrect: false });
        setQuestions(newQuestions);
    };

    const handleRemoveOption = (qIndex, oIndex) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].options.length <= 2) {
            setMessage('Multiple-choice question must have at least two options');
            return;
        }
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, idx) => idx !== oIndex);
        setQuestions(newQuestions);
    };

    const handleCorrectAnswerChange = (qIndex, aIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswers[aIndex] = value;
        setQuestions(newQuestions);
    };

    const handleAddCorrectAnswer = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].correctAnswers.push('');
        setQuestions(newQuestions);
    };

    const handleRemoveCorrectAnswer = (qIndex, aIndex) => {
        const newQuestions = [...questions];
        if (newQuestions[qIndex].correctAnswers.length <= 1) {
            setMessage('Question must have at least one correct answer');
            return;
        }
        newQuestions[qIndex].correctAnswers = newQuestions[qIndex].correctAnswers.filter((_, idx) => idx !== aIndex);
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        if (!title || !description) {
            setMessage('Title and description are required');
            return;
        }
        
        const orderValues = questions.map(q => q.questionOrder);
        if (new Set(orderValues).size !== orderValues.length) {
            setMessage('Question orders must be unique');
            return;
        }
        
        for (const q of questions) {
            if (!q.questionText) {
                setMessage('All questions must have text');
                return;
            }
            if (q.type === 'MULTIPLE_CHOICE') {
                if (q.options.length < 2) {
                    setMessage('Multiple-choice questions must have at least two options');
                    return;
                }
                if (q.options.filter(opt => opt.isCorrect).length !== 1) {
                    setMessage('Multiple-choice questions must have exactly one correct option');
                    return;
                }
            } else {
                if (!q.correctAnswers.some(ans => ans.trim())) {
                    setMessage('Each question must have at least one valid correct answer');
                    return;
                }
            }
            if (q.type === 'PICTURE_RESPONSE' && !q.imageUrl.match(/^(http|https):\/\/.*$/)) {
                setMessage('Picture-response questions must have a valid image URL');
                return;
            }
            if (q.type === 'FILL_IN_THE_BLANK' && !q.questionText.includes('____')) {
                setMessage('Fill-in-the-blank questions must contain "____"');
                return;
            }
        }
        
        const formattedQuestions = questions.map(q => ({
            id: q.id, // Keep existing ID for existing questions
            questionText: q.questionText,
            type: q.type,
            options: q.type === 'MULTIPLE_CHOICE' ? q.options : undefined,
            correctAnswers: q.type !== 'MULTIPLE_CHOICE' ? q.correctAnswers.filter(ans => ans.trim()) : undefined,
            imageUrl: q.type === 'PICTURE_RESPONSE' ? q.imageUrl : undefined,
            questionOrder: q.questionOrder
        }));
        
        try {
            const response = await fetch(`http://localhost:8081/api/quizzes/${quizId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    title,
                    description,
                    randomizeQuestions,
                    singlePage,
                    immediateCorrection,
                    practiceMode,
                    questions: formattedQuestions
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }
            
            setMessage('Quiz updated successfully! Redirecting...');
            setTimeout(() => navigate(`/quiz-summary/${quizId}`), 1200);
        } catch (err) {
            let errorMsg = 'Failed to update quiz: ';
            if (err.message) {
                errorMsg += err.message;
            } else {
                errorMsg += err.toString();
            }
            setMessage(errorMsg);
        }
    };

    if (loading) {
        return <div className="auth-container">Loading quiz...</div>;
    }

    if (error) {
        return (
            <div className="auth-container">
                <div className="auth-error">{error}</div>
                <button onClick={() => navigate('/quizzes')}>Back to Quizzes</button>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <h2>Edit Quiz</h2>
            {message && <p className={message.includes('successfully') ? 'success-message' : 'auth-error'}>{message}</p>}
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    placeholder="Quiz Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Quiz Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <div style={{ marginBottom: '10px' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={randomizeQuestions}
                            onChange={(e) => setRandomizeQuestions(e.target.checked)}
                        />
                        Randomize Question Order
                    </label>
                    <br />
                    <label>
                        <input
                            type="checkbox"
                            checked={singlePage}
                            onChange={(e) => setSinglePage(e.target.checked)}
                        />
                        Display All Questions on Single Page
                    </label>
                    <br />
                    <label>
                        <input
                            type="checkbox"
                            checked={immediateCorrection}
                            onChange={(e) => setImmediateCorrection(e.target.checked)}
                            disabled={singlePage}
                        />
                        Immediate Correction (for multiple-page quizzes)
                    </label>
                    <br />
                    <label>
                        <input
                            type="checkbox"
                            checked={practiceMode}
                            onChange={(e) => setPracticeMode(e.target.checked)}
                        />
                        Allow Practice Mode
                    </label>
                </div>
                {questions.map((q, qIdx) => (
                    <div key={qIdx} style={{marginBottom: '20px', border: '1px solid #ccc', padding: '10px'}}>
                        <div className="question-top-row">
                            <input
                                type="number"
                                placeholder="Question Order"
                                value={q.questionOrder || ''}
                                onChange={(e) => handleQuestionChange(qIdx, 'questionOrder', e.target.value)}
                                min="1"
                                required
                            />
                            <input
                                type="text"
                                className="question-text"
                                placeholder="Question Text"
                                value={q.questionText}
                                onChange={(e) => handleQuestionChange(qIdx, 'questionText', e.target.value)}
                                required
                            />
                            <select
                                className="question-type-select"
                                value={q.type}
                                onChange={(e) => handleQuestionChange(qIdx, 'type', e.target.value)}
                            >
                                <option value="QUESTION_RESPONSE">Question Response</option>
                                <option value="FILL_IN_THE_BLANK">Fill in the Blank</option>
                                <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                                <option value="PICTURE_RESPONSE">Picture Response</option>
                            </select>
                        </div>
                        {q.type === 'FILL_IN_THE_BLANK' && (
                            <p className="helper-text">Use ____ to indicate the blank in the question text.</p>
                        )}
                        {q.type === 'MULTIPLE_CHOICE' ? (
                            <div>
                                <h4>Options</h4>
                                {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="option-row">
                                        <input
                                            type="text"
                                            placeholder={`Option ${oIdx + 1}`}
                                            value={opt.text}
                                            onChange={(e) => handleOptionChange(qIdx, oIdx, 'text', e.target.value)}
                                            required
                                        />
                                        <label className="correct-checkbox">
                                            <input
                                                type="checkbox"
                                                checked={opt.isCorrect}
                                                onChange={(e) => handleOptionChange(qIdx, oIdx, 'isCorrect', e.target.checked)}
                                            />
                                            Correct
                                        </label>
                                        {q.options.length > 2 && (
                                            <button type="button" className="remove-option-btn" onClick={() => handleRemoveOption(qIdx, oIdx)}>
                                                Remove Option
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddOption(qIdx)}>Add Option</button>
                            </div>
                        ) : (
                            <div>
                                {q.correctAnswers.map((ans, aIdx) => (
                                    <div key={aIdx} className="correct-answer-group">
                                        <input
                                            type="text"
                                            placeholder={`Correct Answer ${aIdx + 1}`}
                                            value={ans}
                                            onChange={(e) => handleCorrectAnswerChange(qIdx, aIdx, e.target.value)}
                                            required
                                        />
                                        {q.correctAnswers.length > 1 && (
                                            <button type="button"
                                                    onClick={() => handleRemoveCorrectAnswer(qIdx, aIdx)}>Remove
                                                Answer</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" onClick={() => handleAddCorrectAnswer(qIdx)}>Add Correct Answer
                                </button>
                                {q.type === 'PICTURE_RESPONSE' && (
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={q.imageUrl}
                                        onChange={(e) => handleQuestionChange(qIdx, 'imageUrl', e.target.value)}
                                        required
                                    />
                                )}
                            </div>
                        )}
                        {questions.length > 1 && (
                            <button type="button" onClick={() => handleRemoveQuestion(qIdx)}>Remove Question</button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={handleAddQuestion}>Add Question</button>
                <button type="submit">Update Quiz</button>
                <button type="button" onClick={() => navigate(`/quiz-summary/${quizId}`)} style={{ marginLeft: '10px' }}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default EditQuiz; 