import { useProfile } from '../../application/context/ProfileContext';

/**
 * Hook to check if PriceCharting is enabled for the current user
 */
export const usePriceCharting = () => {
  const { hasPriceChartingApiKey, isLoading, profile } = useProfile();
  
  return {
    isEnabled: hasPriceChartingApiKey,
    isLoading,
    profile
  };
};