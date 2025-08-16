import React, {type ReactNode} from "react";
import {useAuth0Service} from "../../../infrastructure/auth/Auth0Service.ts";
import {AuthContext, type AuthContextType} from "./AuthContext.tsx";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const authService = useAuth0Service();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hasRole = (_role: string): boolean => {
        return false;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const hasPermission = (_permission: string): boolean => {
        return false;
    };

    const contextValue: AuthContextType = {
        ...authService,
        hasRole,
        hasPermission
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};