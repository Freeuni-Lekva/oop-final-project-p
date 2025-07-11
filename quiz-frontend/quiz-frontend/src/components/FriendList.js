import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendList = () => {
    const [friends, setFriends] = useState([]);
    const [error, setError] = useState('');

    const fetchFriends = async () => {
        try {
            const response = await axios.get('/api/friends/list', { withCredentials: true });
            setFriends(response.data);
        } catch (err) {
            setError('Could not fetch friends.');
        }
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    return (
        <div className="friend-list-container">
            <h3>Your Friends</h3>
            {error && <p className="error-message">{error}</p>}
            {friends.length > 0 ? (
                <ul className="friends-list">
                    {friends.map((friend, index) => (
                        <li key={index} className="friend-item">
                            <a href={`/profile/${friend}`}>{friend}</a>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>You haven't added any friends yet.</p>
            )}
        </div>
    );
};

export default FriendList;