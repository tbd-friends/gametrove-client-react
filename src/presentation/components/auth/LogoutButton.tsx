import React from 'react';
import { useAuth } from '../../../application/context/AuthContext';

interface LogoutButtonProps {
    className?: string;
    returnToPath?: string;
    children?: React.ReactNode;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
                                                              className = "btn btn-secondary",
                                                              returnToPath,
                                                              children = "Log Out"
                                                          }) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout(returnToPath);
    };

    return (
        <button onClick={handleLogout} className={className}>
            {children}
        </button>
    );
};