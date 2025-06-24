import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateQuiz = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [randomizeQuestions, setRandomizeQuestions] = useState(false);
    const [singlePage, setSinglePage] = useState(true);
    const [immediateCorrection, setImmediateCorrection] = useState(false);
    const [practiceMode, setPracticeMode] = useState(false);
    const [questions, setQuestions] = useState([
        { questionText: '', type: 'QUESTION_RESPONSE', correctAnswers: [''], options: [], imageUrl: '', questionOrder: 1 }
    ]);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

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
            questionText: q.questionText,
            type: q.type,
            options: q.type === 'MULTIPLE_CHOICE' ? q.options : undefined,
            correctAnswers: q.type !== 'MULTIPLE_CHOICE' ? q.correctAnswers.filter(ans => ans.trim()) : undefined,
            imageUrl: q.type === 'PICTURE_RESPONSE' ? q.imageUrl : undefined,
            questionOrder: q.questionOrder
        }));
        try {
            await axios.post(
                'http://localhost:8081/api/quizzes',
                {
                    title,
                    description,
                    randomizeQuestions,
                    singlePage,
                    immediateCorrection,
                    practiceMode,
                    questions: formattedQuestions
                },
                { withCredentials: true }
            );
            setMessage('Quiz created successfully! Redirecting...');
            setTimeout(() => navigate('/quizzes'), 1200);
        } catch (err) {
            let errorMsg = 'Failed to create quiz: ';
            if (err.response?.data) {
                if (typeof err.response.data === 'string') {
                    errorMsg += err.response.data;
                } else if (err.response.data.message) {
                    errorMsg += err.response.data.message;
                } else {
                    errorMsg += JSON.stringify(err.response.data);
                }
            } else {
                errorMsg += err.message;
            }
            setMessage(errorMsg);
        }
    };

    useEffect(() => {
        document.title = "Create Quiz";
    }, []);

    return (
        <div className="auth-container">
            <h2>Create Quiz</h2>
            {message && <p>{message}</p>}
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
                <button type="submit">Create Quiz</button>
            </form>
        </div>
    );
};

export default CreateQuiz;