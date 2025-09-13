import {createContext, useContext} from 'react';
import type {IAuthenticationService} from '../../../domain/interfaces/IAuthenticationService.ts';

// TODO: Add role-based access control when implementing proper JWT token parsing
export interface AuthContextType extends IAuthenticationService {
    // hasRole: (role: string) => boolean;
    // hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
