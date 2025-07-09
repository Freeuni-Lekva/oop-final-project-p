import React, { useEffect, useState } from 'react';
import FriendsModal from './FriendsModal';
import MessagesModal from './MessagesModal';
import './Friends.css';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [announcements, setAnnouncements] = useState([]);
    const [isFriendsModalOpen, setFriendsModalOpen] = useState(false);
    const [isMessagesModalOpen, setMessagesModalOpen] = useState(false);
    const [isSignOutModalOpen, setSignOutModalOpen] = useState(false);
    const [challenges, setChallenges] = useState([]);
    const [userId, setUserId] = useState(null);
    const [challengeScores, setChallengeScores] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Home";

        fetch('http://localhost:8081/api/home', { credentials: 'include' })
            .then((res) => {
                if (!res.ok) throw new Error('Not authenticated or server error');
                return res.json();
            })
            .then((data) => {
                setMessage(data.message);
                setUsername(data.user);
                // Fetch userId
                if (data.user) {
                  fetch(`http://localhost:8081/api/auth/user/${data.user}`)
                    .then(res => {
                      if (!res.ok) throw new Error('Failed to fetch user data');
                      return res.json();
                    })
                    .then(user => {
                      setUserId(user.id);
                      // Fetch challenges for this user
                      fetch(`http://localhost:8081/api/challenges/for-user/${data.user}`)
                        .then(res => {
                          if (!res.ok) throw new Error('Failed to fetch challenges');
                          return res.json();
                        })
                        .then(async (chals) => {
                          if (!Array.isArray(chals)) {
                            setChallenges([]);
                            return;
                          }
                          setChallenges(chals);
                          // For each challenge, fetch best score
                          const scores = {};
                          for (const chal of chals) {
                            try {
                              const res = await fetch(`http://localhost:8081/api/challenges/challenger-best-score/${chal.quiz.id}/${chal.challenger.username}`);
                              if (res.ok) {
                                const score = await res.json();
                                scores[chal.id] = score;
                              } else {
                                scores[chal.id] = 0; // Default score if fetch fails
                              }
                            } catch (e) {
                              scores[chal.id] = 0; // Default score if fetch fails
                            }
                          }
                          setChallengeScores(scores);
                        })
                        .catch(err => {
                          console.error('Challenges fetch error:', err);
                          setChallenges([]);
                        });
                    })
                    .catch(err => {
                      console.error('User fetch error:', err);
                    });
                }
            })
            .catch((err) => setError(err.message));

        fetch('http://localhost:8081/api/announcements')
            .then((res) => res.json())
            .then((data) => setAnnouncements(data))
            .catch((err) => console.error("Failed to fetch announcements:", err));
    }, []);

    const handleSignOut = async () => {
        try {
            await fetch('http://localhost:8081/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (e) {}
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="auth-container">
            {/* Top-left sign out button */}
            <div className="top-left-signout">
                <button className="signout-icon-button" onClick={() => setSignOutModalOpen(true)} title="Sign Out">
                    ⬅️
                </button>
            </div>

            {/* Sign-out Modal */}
            {isSignOutModalOpen && (
                <div className="signout-modal-overlay">
                    <div className="signout-modal-content">
                        <h3>Sign Out?</h3>
                        <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
                            <button onClick={() => setSignOutModalOpen(false)} className="cancel-signout-button">Cancel</button>
                            <button onClick={handleSignOut} className="confirm-signout-button">Sign Out</button>
                        </div>
                    </div>
                </div>
            )}

            {error && <div className="auth-error">{error}</div>}

            {/* Challenge Notifications */}
            {challenges.length > 0 && (
              <div className="challenge-notifications" style={{ background: '#f0f4ff', border: '1px solid #b6d0ff', borderRadius: 8, padding: 16, marginBottom: 18 }}>
                <h3>🎯 Challenges</h3>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {challenges.map(chal => (
                    <li key={chal.id} style={{ marginBottom: 10 }}>
                      <b>{chal.challenger.username}</b> has challenged you to take <b>{chal.quiz.title}</b>!<br/>
                      Their best score: <b>{challengeScores[chal.id]}</b><br/>
                      <button className="quiz-btn quiz-btn-primary" style={{ marginTop: 4 }} onClick={() => navigate(`/quiz-summary/${chal.quiz.id}`)}>
                        Go to Quiz
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="main-box">
                <h2>{message || 'Welcome!'}</h2>
                {username && <p>Hello, <b>{username}</b>!</p>}
                {username && (
                    <button onClick={() => navigate('/create-quiz')} style={{ marginTop: '16px' }}>
                        Create a New Quiz
                    </button>
                )}
            </div>

            <div className="announcement-box">
                <h3>📣 Announcements</h3>
                {announcements.length === 0 ? (
                    <p>No announcements available.</p>
                ) : (
                    <ul>
                        {announcements.map((a) => (
                            <li key={a.id}>
                                <strong>{a.title}</strong><br />
                                <span>{a.content}</span><br />
                                <small>{new Date(a.createdAt).toLocaleString()}</small>
                                <hr />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Navigation Buttons */}
            <button onClick={() => navigate('/quizzes')} style={{marginTop: '20px', marginRight: '10px'}}>Browse Quizzes</button>
            <button onClick={() => navigate('/create-quiz')} style={{marginTop: '20px'}}>Create a Quiz</button>

            {/* Top-right floating icons */}
            <div className="top-right-icons">
                <button onClick={() => setMessagesModalOpen(true)} className="messages-icon-button" title="Messages">
                    💬
                </button>
                <button onClick={() => setFriendsModalOpen(true)} className="friends-icon-button" title="Friends">
                    👥
                </button>
            </div>

            {/* Modals */}
            <FriendsModal
                isOpen={isFriendsModalOpen}
                onClose={() => setFriendsModalOpen(false)}
            />
            <MessagesModal
                isOpen={isMessagesModalOpen}
                onClose={() => setMessagesModalOpen(false)}
            />
        </div>
    );
};

export default Home;