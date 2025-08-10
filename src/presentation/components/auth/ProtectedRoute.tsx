import React from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { LoginButton } from './LoginButton';

interface ProtectedRouteProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireRole?: string;
    requirePermission?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
                                                                  children,
                                                                  fallback,
                                                                  requireRole,
                                                                  requirePermission
                                                              }) => {
    const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();

    if (isLoading) {
        return <div>Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        return fallback || (
            <div>
                <p>Please log in to access this content.</p>
                <LoginButton />
            </div>
        );
    }

    // Domain-driven authorization checks
    if (requireRole && !hasRole(requireRole)) {
        return <div>You don't have the required role: {requireRole}</div>;
    }

    if (requirePermission && !hasPermission(requirePermission)) {
        return <div>You don't have the required permission: {requirePermission}</div>;
    }

    return <>{children}</>;
};