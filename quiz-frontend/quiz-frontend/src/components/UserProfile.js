import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './UserProfile.css';

function getInitials(name) {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

const UserProfile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState('');
    const [friendStatus, setFriendStatus] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [pendingRequestId, setPendingRequestId] = useState(null);
    const [quizHistory, setQuizHistory] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:8081/api/users/${username}`, { credentials: 'include' })
            .then(res => {
                if (!res.ok) throw new Error('User not found');
                return res.json();
            })
            .then(data => {
                setProfile(data);
                setFriendStatus(data.friendStatus);
                setCurrentUser(data.currentUser);
                // If pending, check if the profile user sent the request
                if (data.friendStatus === 'PENDING' && data.currentUser) {
                    fetch('http://localhost:8081/api/friends/requests', { credentials: 'include' })
                        .then(res => res.json())
                        .then(requests => {
                            const req = requests.find(r => r.requesterUsername === username);
                            if (req) setPendingRequestId(req.id);
                            else setPendingRequestId(null);
                        });
                } else {
                    setPendingRequestId(null);
                }
                // Fetch quiz history
                fetch(`http://localhost:8081/api/users/${username}/quiz-history`, { credentials: 'include' })
                    .then(res => res.json())
                    .then(history => setQuizHistory(history));
            })
            .catch(err => setError(err.message));
    }, [username]);

    const handleAddFriend = () => {
        fetch('http://localhost:8081/api/friends/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username }),
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to send friend request');
                return res.json();
            })
            .then(() => {
                setSuccess('Friend request sent!');
                setFriendStatus('PENDING');
            })
            .catch(err => setError(err.message));
    };

    const handleRemoveFriend = () => {
        fetch('http://localhost:8081/api/friends/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username }),
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to remove friend');
                return res.json();
            })
            .then(() => {
                setSuccess('Friend removed successfully.');
                setFriendStatus('NONE');
            })
            .catch(err => setError(err.message));
    };

    const handleAcceptRequest = () => {
        if (!pendingRequestId) return;
        fetch(`http://localhost:8081/api/friends/accept/${pendingRequestId}`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to accept request');
                return res.json();
            })
            .then(() => {
                setSuccess('Friend request accepted!');
                setFriendStatus('FRIENDS');
                setPendingRequestId(null);
            })
            .catch(err => setError(err.message));
    };
    const handleRejectRequest = () => {
        if (!pendingRequestId) return;
        fetch(`http://localhost:8081/api/friends/reject/${pendingRequestId}`, {
            method: 'POST',
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to reject request');
                return res.json();
            })
            .then(() => {
                setSuccess('Friend request rejected.');
                setFriendStatus('NONE');
                setPendingRequestId(null);
            })
            .catch(err => setError(err.message));
    };

    if (error) return <div className="profile-error">{error}</div>;
    if (!profile) return <div className="profile-loading">Loading...</div>;

    return (
        <div className="profile-page-bg">
            <div className="profile-card-modern">
                <div className="profile-avatar-wrapper">
                    <div className="profile-avatar-modern">
                        <span className="profile-avatar-initials">{getInitials(profile.username)}</span>
                    </div>
                </div>
                <div className="profile-header-modern">
                    <h2 className="profile-username-modern">{profile.username}</h2>
                    <p className="profile-id-modern">User ID: {profile.id}</p>
                </div>
                <div className="profile-status">
                    {currentUser === profile.username ? (
                        <p className="profile-self">This is your profile.</p>
                    ) : friendStatus === 'FRIENDS' ? (
                        <>
                            <p className="profile-friends">You are already friends.</p>
                            <button className="profile-remove-friend" onClick={handleRemoveFriend} style={{backgroundColor: '#f44336', color: '#fff', marginTop: '0.5rem'}}>Remove Friend</button>
                        </>
                    ) : friendStatus === 'PENDING' ? (
                        pendingRequestId ? (
                            <div className="profile-pending">
                                <p>Friend request pending. Respond?</p>
                                <button className="profile-accept-friend" onClick={handleAcceptRequest} style={{backgroundColor: '#28a745', color: '#fff', marginRight: '0.5rem'}}>Accept</button>
                                <button className="profile-reject-friend" onClick={handleRejectRequest} style={{backgroundColor: '#f44336', color: '#fff'}}>Reject</button>
                            </div>
                        ) : (
                            <p className="profile-pending">Friend request pending.</p>
                        )
                    ) : (
                        <button className="profile-add-friend" onClick={handleAddFriend}>Add Friend</button>
                    )}
                    {success && <div className="profile-success">{success}</div>}
                </div>
            </div>
            <div className="profile-quiz-history-modern">
                <h3>Recently Taken Quizzes</h3>
                {quizHistory.length === 0 ? (
                    <p>No quizzes taken yet.</p>
                ) : (
                    <ul className="quiz-history-list">
                        {quizHistory.map((q, idx) => (
                            <li key={idx} className="quiz-history-item">
                                <div><b>{q.quizTitle}</b></div>
                                <div>Score: {q.score} / {q.totalQuestions} ({q.percentage.toFixed(1)}%)</div>
                                <div style={{fontSize: '0.9em', color: '#888'}}>Taken: {q.endTime ? new Date(q.endTime).toLocaleString() : 'N/A'}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UserProfile; 