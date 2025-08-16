import { useAuth0Service } from '../../infrastructure/auth/Auth0Service';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const authService = useAuth0Service();
  
  return (
    <AuthContext.Provider value={authService}>
      {children}
    </AuthContext.Provider>
  );
}