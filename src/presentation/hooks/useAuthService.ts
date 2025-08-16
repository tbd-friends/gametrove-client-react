import { useContext } from 'react';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';
import { AuthContext } from '../contexts/AuthContext';

export function useAuthService(): IAuthenticationService {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthService must be used within an AuthProvider');
  }
  return context;
}