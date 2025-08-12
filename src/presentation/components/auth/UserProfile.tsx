import React from 'react';
import { useAuth } from '../../../application/context/AuthContext';

export const UserProfile: React.FC = () => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div>Loading user profile...</div>;
    }

    if (!isAuthenticated || !user) {
        return <div>Please log in to view your profile.</div>;
    }

    return (
        <div className="user-profile">
            {user.picture && (
                <img
                    src={user.picture}
                    alt={user.name}
                    className="user-avatar"
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                />
            )}
            <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <p>Email verified: {user.emailVerified ? '✅' : '❌'}</p>
            </div>
        </div>
    );
};