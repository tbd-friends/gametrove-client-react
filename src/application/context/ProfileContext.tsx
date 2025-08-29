import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthService } from '../../presentation/hooks/useAuthService';
import { createProfileApiService } from '../../infrastructure/api/ProfileApiService';
import type { UserProfile } from '../../infrastructure/api/ProfileApiService';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  hasPriceChartingApiKey: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authService = useAuthService();

  const loadProfile = async () => {
    if (!authService.isAuthenticated || authService.isLoading) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const profileApiService = createProfileApiService(authService);
      const userProfile = await profileApiService.getUserProfile();
      setProfile(userProfile);
    } catch (err) {
      console.error('Failed to load user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authService.isAuthenticated && !authService.isLoading) {
      loadProfile();
    } else if (!authService.isAuthenticated) {
      // Clear profile when user logs out
      setProfile(null);
      setError(null);
    }
  }, [authService.isAuthenticated, authService.isLoading]);

  const value: ProfileContextType = {
    profile,
    isLoading,
    error,
    hasPriceChartingApiKey: profile?.hasPriceChartingApiKey || false,
    refreshProfile: loadProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};