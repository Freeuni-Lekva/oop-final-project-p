import React, { useState } from 'react';
import axios from 'axios';

const RemoveFriend = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setResult(null);
        try {
            const response = await axios.get(`/api/friends/list`, { withCredentials: true });
            if (response.data.includes(query)) {
                setResult(query);
            } else {
                setError('User is not in your friend list.');
            }
        } catch (err) {
            setError('Error searching for friend.');
        }
    };

    const handleRemove = async () => {
        setMessage('');
        setError('');
        try {
            const response = await axios.post('/api/friends/remove', { username: result }, { withCredentials: true });
            setMessage(response.data.message || 'Friend removed successfully.');
            setResult(null);
            setQuery('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to remove friend.');
        }
    };

    return (
        <div className="remove-friend-container">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Enter friend's username to remove"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                />
                <button type="submit">Search</button>
            </form>
            {error && <p className="error-message">{error}</p>}
            {message && <p className="success-message">{message}</p>}
            {result && (
                <div className="remove-friend-result">
                    <span>{result}</span>
                    <button onClick={handleRemove} className="accept-request-button" style={{backgroundColor: '#f44336', marginLeft: '8px'}}>
                        Remove from Friend List
                    </button>
                </div>
            )}
        </div>
    );
};

export default RemoveFriend; 