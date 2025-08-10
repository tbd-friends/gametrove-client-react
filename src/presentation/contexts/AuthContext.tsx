import { createContext, useContext } from 'react';
import type { IAuthenticationService } from '../../domain/interfaces/IAuthenticationService';
import { useAuth0Service } from '../../infrastructure/auth/Auth0Service';

const AuthContext = createContext<IAuthenticationService | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authService = useAuth0Service();
  
  return (
    <AuthContext.Provider value={authService}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthService(): IAuthenticationService {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthService must be used within an AuthProvider');
  }
  return context;
}