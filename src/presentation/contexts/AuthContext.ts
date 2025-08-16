import { createContext } from 'react';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';

export const AuthContext = createContext<IAuthenticationService | null>(null);