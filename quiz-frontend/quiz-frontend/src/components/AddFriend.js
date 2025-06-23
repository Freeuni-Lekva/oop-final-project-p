import React, { useState } from 'react';
import axios from 'axios';

const AddFriend = () => {
    const [friendUsername, setFriendUsername] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await axios.post('/api/friends/add', { username: friendUsername }, { withCredentials: true });
            setMessage(response.data.message);
            setFriendUsername(''); // Clear input after success
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add friend.');
        }
    };

    return (
        <div className="add-friend-container">
            <h3>Add a Friend</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter friend's username"
                    value={friendUsername}
                    onChange={(e) => setFriendUsername(e.target.value)}
                    required
                />
                <button type="submit">Add Friend</button>
            </form>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </div>
    );
};

export default AddFriend; 