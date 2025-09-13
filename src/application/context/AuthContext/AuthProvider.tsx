import React, {type ReactNode} from "react";
import {useAuth0Service} from "../../../infrastructure/auth/Auth0Service.ts";
import {AuthContext, type AuthContextType} from "./AuthContext.tsx";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const authService = useAuth0Service();

    // TODO: Implement proper role-based access control
    // For now, removing these functions to prevent false security assumptions
    // When implementing, parse JWT token claims for roles and permissions

    const contextValue: AuthContextType = {
        ...authService
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};