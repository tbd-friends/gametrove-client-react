import { useState, useEffect } from 'react';
import type { UserProfile, UpdatePriceChartingApiKeyRequest } from '../../infrastructure/api/ProfileApiService';
import type { PlatformMappingRequest } from '../../infrastructure/api/PlatformApiService';
import type { IgdbPlatform } from '../../domain/models/IgdbGame';
import type { Platform } from '../../domain/models/Platform';
import { createProfileApiService } from '../../infrastructure/api/ProfileApiService';
import { createPlatformApiService } from '../../infrastructure/api/PlatformApiService';
import { createPriceChartingApiService } from '../../infrastructure/api/PriceChartingApiService';
import { useAuthService } from './useAuthService';
import { useProfile } from '../../application/context/ProfileContext';
import { usePlatforms, useIgdbPlatforms } from './index';
import { logger } from '../../shared/utils/logger';

export interface SettingsData {
  // Profile state
  profile: UserProfile | null;
  profileLoading: boolean;
  profileNotFound: boolean;
  formData: {
    name: string;
    favoriteGame: string;
  };
  originalFormData: {
    name: string;
    favoriteGame: string;
  };
  saveLoading: boolean;
  saveError: string | null;
  
  // PriceCharting state
  priceChartingApiKey: string;
  originalPriceChartingApiKey: string;
  showApiKey: boolean;
  priceChartingSaveLoading: boolean;
  priceChartingSaveError: string | null;
  
  // Price update state
  triggerUpdateLoading: boolean;
  triggerUpdateError: string | null;
  triggerUpdateSuccess: boolean;
  
  // Platform mapping state
  platforms: Platform[];
  igdbPlatforms: IgdbPlatform[];
  platformsLoading: boolean;
  igdbPlatformsLoading: boolean;
  platformMappings: Record<string, IgdbPlatform | null>;
  publishingMappings: boolean;
  
  // Form validation
  isFormDirty: () => boolean;
  isFormValid: () => boolean;
  canSave: () => boolean;
  isPriceChartingFormDirty: () => boolean;
  isPriceChartingFormValid: () => boolean;
  canSavePriceCharting: () => boolean;
  
  // Event handlers
  handleInputChange: (field: string, value: string) => void;
  handleSaveProfile: () => Promise<void>;
  handleCancelChanges: () => void;
  handlePriceChartingApiKeyChange: (value: string) => void;
  handleToggleShowApiKey: () => void;
  handleClearApiKey: () => void;
  handleSavePriceChartingApiKey: () => Promise<void>;
  handleCancelPriceChartingChanges: () => void;
  handleTriggerPriceUpdate: () => Promise<void>;
  handlePlatformChange: (platformId: string, igdbPlatform: IgdbPlatform | null) => void;
  handlePublishMappings: () => Promise<void>;
  handleReloadPlatforms: () => void;
}

export const useSettingsData = (): SettingsData => {
  const authService = useAuthService();
  const { profile, isLoading: profileLoading, refreshProfile } = useProfile();
  const { platforms, loading: platformsLoading } = usePlatforms();
  const { platforms: igdbPlatforms, loading: igdbPlatformsLoading, reloadPlatforms } = useIgdbPlatforms();
  
  const profileNotFound = !profile && !profileLoading;
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: "",
    favoriteGame: ""
  });
  const [originalFormData, setOriginalFormData] = useState({
    name: "",
    favoriteGame: ""
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // PriceCharting state
  const [priceChartingApiKey, setPriceChartingApiKey] = useState("");
  const [originalPriceChartingApiKey, setOriginalPriceChartingApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [priceChartingSaveLoading, setPriceChartingSaveLoading] = useState(false);
  const [priceChartingSaveError, setPriceChartingSaveError] = useState<string | null>(null);

  // Price update state
  const [triggerUpdateLoading, setTriggerUpdateLoading] = useState(false);
  const [triggerUpdateError, setTriggerUpdateError] = useState<string | null>(null);
  const [triggerUpdateSuccess, setTriggerUpdateSuccess] = useState(false);

  // Platform mappings state
  const [platformMappings, setPlatformMappings] = useState<Record<string, IgdbPlatform | null>>({});
  const [publishingMappings, setPublishingMappings] = useState(false);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      const profileData = {
        name: profile.name,
        favoriteGame: profile.favoriteGame
      };
      setFormData(profileData);
      setOriginalFormData(profileData);
      
      const apiKeyValue = profile.hasPriceChartingApiKey ? "••••••••••••••••" : "";
      setPriceChartingApiKey(apiKeyValue);
      setOriginalPriceChartingApiKey(apiKeyValue);
    } else if (!profileLoading) {
      const emptyData = {
        name: "",
        favoriteGame: ""
      };
      setFormData(emptyData);
      setOriginalFormData(emptyData);
      setPriceChartingApiKey("");
      setOriginalPriceChartingApiKey("");
    }
  }, [profile, profileLoading]);

  // Initialize platform mappings
  useEffect(() => {
    if (platforms.length > 0 && igdbPlatforms.length > 0) {
      const initialMappings: Record<string, IgdbPlatform | null> = {};
      platforms.forEach(platform => {
        if (platform.igdbPlatformId) {
          const igdbPlatform = igdbPlatforms.find(p => p.id === platform.igdbPlatformId);
          initialMappings[platform.id] = igdbPlatform || null;
        } else {
          initialMappings[platform.id] = null;
        }
      });
      setPlatformMappings(initialMappings);
      logger.debug('Initialized platform mappings', { count: Object.keys(initialMappings).length }, 'SETTINGS');
    }
  }, [platforms, igdbPlatforms]);

  useEffect(() => {
    if (platforms.length > 0) {
      setPlatformMappings(prev => {
        const newMappings = {...prev};
        platforms.forEach(platform => {
          if (!(platform.id in newMappings)) {
            newMappings[platform.id] = null;
          }
        });
        return newMappings;
      });
    }
  }, [platforms]);

  // Form validation functions
  const isFormDirty = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const isFormValid = () => {
    return formData.name.trim().length > 0;
  };

  const canSave = () => {
    return isFormValid() && isFormDirty() && !saveLoading;
  };

  const isPriceChartingFormDirty = () => {
    return priceChartingApiKey !== originalPriceChartingApiKey;
  };

  const isPriceChartingFormValid = () => {
    return true;
  };

  const canSavePriceCharting = () => {
    return isPriceChartingFormValid() && isPriceChartingFormDirty() && !priceChartingSaveLoading;
  };

  // Event handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (saveError) {
      setSaveError(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!canSave()) {
      return;
    }

    try {
      setSaveLoading(true);
      setSaveError(null);

      const profileData: UserProfile = {
        name: formData.name.trim(),
        favoriteGame: formData.favoriteGame?.trim(),
        hasPriceChartingApiKey: profile?.hasPriceChartingApiKey || false
      };

      const profileApiService = createProfileApiService(authService);
      await profileApiService.updateUserProfile(profileData);

      await refreshProfile();
      setOriginalFormData({...formData});

      logger.info('Profile saved successfully', undefined, 'SETTINGS');
    } catch (error) {
      logger.error('Failed to save profile', error instanceof Error ? error.message : error, 'SETTINGS');
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelChanges = () => {
    setFormData({...originalFormData});
    setSaveError(null);
  };

  const handlePriceChartingApiKeyChange = (value: string) => {
    setPriceChartingApiKey(value);
    if (priceChartingSaveError) {
      setPriceChartingSaveError(null);
    }
  };

  const handleToggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const handleClearApiKey = () => {
    setPriceChartingApiKey("");
    if (priceChartingSaveError) {
      setPriceChartingSaveError(null);
    }
  };

  const handleSavePriceChartingApiKey = async () => {
    if (!canSavePriceCharting()) {
      return;
    }

    try {
      setPriceChartingSaveLoading(true);
      setPriceChartingSaveError(null);

      const trimmedApiKey = priceChartingApiKey.trim();
      const request: UpdatePriceChartingApiKeyRequest = {
        priceChartingApiKey: trimmedApiKey.length > 0 ? trimmedApiKey : null
      };

      const profileApiService = createProfileApiService(authService);
      await profileApiService.updatePriceChartingApiKey(request);

      setOriginalPriceChartingApiKey(priceChartingApiKey);
      await refreshProfile();

      logger.info('PriceCharting API key saved successfully', undefined, 'SETTINGS');
    } catch (error) {
      logger.error('Failed to save PriceCharting API key', error instanceof Error ? error.message : error, 'SETTINGS');
      setPriceChartingSaveError(error instanceof Error ? error.message : 'Failed to save API key');
    } finally {
      setPriceChartingSaveLoading(false);
    }
  };

  const handleCancelPriceChartingChanges = () => {
    setPriceChartingApiKey(originalPriceChartingApiKey);
    setPriceChartingSaveError(null);
  };

  const handleTriggerPriceUpdate = async () => {
    if (!profile?.hasPriceChartingApiKey) {
      setTriggerUpdateError('PriceCharting API key is required to trigger pricing updates');
      return;
    }

    try {
      setTriggerUpdateLoading(true);
      setTriggerUpdateError(null);
      setTriggerUpdateSuccess(false);

      const priceChartingApiService = createPriceChartingApiService(authService);
      await priceChartingApiService.triggerPricingUpdate();

      setTriggerUpdateSuccess(true);
      logger.info('Price update triggered successfully', undefined, 'SETTINGS');
    } catch (error) {
      logger.error('Failed to trigger price update', error instanceof Error ? error.message : error, 'SETTINGS');
      setTriggerUpdateError(error instanceof Error ? error.message : 'Failed to trigger price update');
    } finally {
      setTriggerUpdateLoading(false);
    }
  };

  const handlePlatformChange = (platformId: string, igdbPlatform: IgdbPlatform | null) => {
    setPlatformMappings(prev => ({...prev, [platformId]: igdbPlatform}));
  };

  const handlePublishMappings = async () => {
    try {
      setPublishingMappings(true);

      const mappingsArray = Object.entries(platformMappings)
        .filter(([, igdbPlatform]) => igdbPlatform !== null)
        .map(([platformIdentifier, igdbPlatform]) => ({
          platformIdentifier,
          igdbPlatformId: igdbPlatform!.id
        }));

      const request: PlatformMappingRequest = {
        platforms: mappingsArray
      };

      if (mappingsArray.length === 0) {
        logger.debug('No mappings to publish', undefined, 'SETTINGS');
        return;
      }

      const platformApiService = createPlatformApiService(authService);
      await platformApiService.publishPlatformMappings(request);

      logger.info('Published platform mappings', { count: mappingsArray.length }, 'SETTINGS');
    } catch (error) {
      logger.error('Failed to publish platform mappings', error instanceof Error ? error.message : error, 'SETTINGS');
    } finally {
      setPublishingMappings(false);
    }
  };

  const handleReloadPlatforms = () => {
    reloadPlatforms();
  };

  return {
    profile,
    profileLoading,
    profileNotFound,
    formData,
    originalFormData,
    saveLoading,
    saveError,
    priceChartingApiKey,
    originalPriceChartingApiKey,
    showApiKey,
    priceChartingSaveLoading,
    priceChartingSaveError,
    triggerUpdateLoading,
    triggerUpdateError,
    triggerUpdateSuccess,
    platforms,
    igdbPlatforms,
    platformsLoading,
    igdbPlatformsLoading,
    platformMappings,
    publishingMappings,
    isFormDirty,
    isFormValid,
    canSave,
    isPriceChartingFormDirty,
    isPriceChartingFormValid,
    canSavePriceCharting,
    handleInputChange,
    handleSaveProfile,
    handleCancelChanges,
    handlePriceChartingApiKeyChange,
    handleToggleShowApiKey,
    handleClearApiKey,
    handleSavePriceChartingApiKey,
    handleCancelPriceChartingChanges,
    handleTriggerPriceUpdate,
    handlePlatformChange,
    handlePublishMappings,
    handleReloadPlatforms
  };
};