import React, { useState } from 'react';
import axios from 'axios';

const UserSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [message, setMessage] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const response = await axios.get(`/api/friends/search?username=${query}`, { withCredentials: true });
            setResults(response.data);
            if (response.data.length === 0) {
                setMessage('No users found.');
            }
        } catch (err) {
            setMessage('Error searching for users.');
        }
    };

    const handleAddFriend = async (username) => {
        setMessage('');
        try {
            const response = await axios.post('/api/friends/request', { username }, { withCredentials: true });
            setMessage(response.data.message || 'Friend request sent!');
        } catch (err) {
            setMessage(err.response?.data?.error || 'Failed to send request.');
        }
    };

    return (
        <div className="user-search-container">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search for users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
                <button type="submit">Search</button>
            </form>
            {message && <p>{message}</p>}
            <ul className="user-search-results">
                {results.map((user) => (
                    <li key={user.username} className="search-result-item">
                        <a href={`/profile/${user.username}`}>{user.username}</a>
                        <button onClick={() => handleAddFriend(user.username)} className="add-friend-button">
                            Send Request
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default UserSearch;