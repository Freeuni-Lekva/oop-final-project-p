import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendRequests = ({ onRequestsCountChange }) => {
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');

    const fetchRequests = async () => {
        try {
            const response = await axios.get('/api/friends/requests', { withCredentials: true });
            setRequests(response.data);
            onRequestsCountChange(response.data.length);
        } catch (err) {
            setMessage('Could not fetch friend requests.');
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAccept = async (requestId) => {
        try {
            await axios.post(`/api/friends/accept/${requestId}`, {}, { withCredentials: true });
            fetchRequests(); // Re-fetch to update the list
        } catch (err) {
            setMessage('Failed to accept request.');
        }
    };

    const handleReject = async (requestId) => {
        setMessage('');
        try {
            await axios.post(`/api/friends/reject/${requestId}`, {}, { withCredentials: true });
            setMessage('Friend request rejected.');
            fetchRequests(); // Refresh list
        } catch (err) {
            setMessage('Failed to reject request.');
        }
    };

    return (
        <div className="friend-requests-container">
            {message && <p>{message}</p>}
            {requests.length > 0 ? (
                <ul className="friend-requests-list">
                    {requests.map((request) => (
                        <li key={request.id} className="request-item">
                            <span className="request-username">{request.requesterUsername}</span>
                            <button onClick={() => handleAccept(request.id)} className="accept-request-button">
                                Accept
                            </button>
                            <button onClick={() => handleReject(request.id)} className="accept-request-button" style={{backgroundColor: '#f44336', marginLeft: '8px'}}>
                                Reject
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No new friend requests.</p>
            )}
        </div>
    );
};

export default FriendRequests; 