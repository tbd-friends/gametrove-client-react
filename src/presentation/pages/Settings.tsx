import React, {useState, useEffect} from "react";
import {TrendingUp, Eye, EyeOff, Copy, RotateCcw, Upload, Trash2} from "lucide-react";
import {usePlatforms, useIgdbPlatforms} from "../hooks";
import {createPlatformApiService} from "../../infrastructure/api/PlatformApiService";
import type {PlatformMappingRequest} from "../../infrastructure/api/PlatformApiService";
import {createProfileApiService} from "../../infrastructure/api/ProfileApiService";
import type {UserProfile, UpdatePriceChartingApiKeyRequest} from "../../infrastructure/api/ProfileApiService";
import {useAuthService} from "../hooks/useAuthService";
import {useProfile} from "../../application/context/ProfileContext";
import {IgdbPlatformCombobox} from "../components/forms";
import type {IgdbPlatform} from "../../domain/models/IgdbGame";

type TabType = "profile" | "pricecharting" | "igdb";

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [showApiKey, setShowApiKey] = useState(false);

    // Profile state from global context
    const { profile, isLoading: profileLoading, refreshProfile } = useProfile();
    const profileNotFound = !profile && !profileLoading;
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

    // PriceCharting API key state
    const [priceChartingApiKey, setPriceChartingApiKey] = useState("");
    const [originalPriceChartingApiKey, setOriginalPriceChartingApiKey] = useState("");
    const [priceChartingSaveLoading, setPriceChartingSaveLoading] = useState(false);
    const [priceChartingSaveError, setPriceChartingSaveError] = useState<string | null>(null);

    const {platforms, loading: platformsLoading} = usePlatforms();
    const {platforms: igdbPlatforms, loading: igdbPlatformsLoading, reloadPlatforms} = useIgdbPlatforms();
    const authService = useAuthService();

    // Track mappings with IGDB platforms - mapping platformId to IgdbPlatform
    const [platformMappings, setPlatformMappings] = useState<Record<string, IgdbPlatform | null>>({});
    const [publishingMappings, setPublishingMappings] = useState(false);

    // Update form data when profile loads from global context
    useEffect(() => {
        if (profile) {
            const profileData = {
                name: profile.name,
                favoriteGame: profile.favoriteGame
            };
            setFormData(profileData);
            setOriginalFormData(profileData);
            
            // Set PriceCharting API key state
            const apiKeyValue = profile.hasPriceChartingApiKey ? "••••••••••••••••" : "";
            setPriceChartingApiKey(apiKeyValue);
            setOriginalPriceChartingApiKey(apiKeyValue);
        } else if (!profileLoading) {
            // Reset form when no profile
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

    // Initialize platform mappings from existing platform data when both datasets are loaded
    useEffect(() => {
        if (platforms.length > 0 && igdbPlatforms.length > 0) {
            const initialMappings: Record<string, IgdbPlatform | null> = {};
            platforms.forEach(platform => {
                if (platform.igdbPlatformId) {
                    // Find the corresponding IgdbPlatform by ID
                    const igdbPlatform = igdbPlatforms.find(p => p.id === platform.igdbPlatformId);
                    initialMappings[platform.id] = igdbPlatform || null;
                } else {
                    initialMappings[platform.id] = null;
                }
            });
            setPlatformMappings(initialMappings);
            console.log('🔗 Initialized platform mappings:', initialMappings);
        }
    }, [platforms, igdbPlatforms]);

    // Also initialize when just platforms load (for unmapped platforms)
    useEffect(() => {
        if (platforms.length > 0) {
            setPlatformMappings(prev => {
                const newMappings = {...prev};
                platforms.forEach(platform => {
                    // Only initialize if we don't already have this platform mapped
                    if (!(platform.id in newMappings)) {
                        newMappings[platform.id] = null;
                    }
                });
                return newMappings;
            });
        }
    }, [platforms]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
        // Clear save error when user makes changes
        if (saveError) {
            setSaveError(null);
        }
    };

    // Check if form data has changed from original
    const isFormDirty = () => {
        return JSON.stringify(formData) !== JSON.stringify(originalFormData);
    };

    // Check if form is valid (name is required)
    const isFormValid = () => {
        return formData.name.trim().length > 0;
    };

    // Check if save button should be enabled
    const canSave = () => {
        return isFormValid() && isFormDirty() && !saveLoading;
    };

    const handlePlatformChange = (platformId: string, igdbPlatform: IgdbPlatform | null) => {
        setPlatformMappings(prev => ({...prev, [platformId]: igdbPlatform}));
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

            // Update the global profile context and original form data on success
            await refreshProfile();
            setOriginalFormData({...formData});

            console.log('✅ Profile saved successfully');
        } catch (error) {
            console.error('❌ Failed to save profile:', error);
            setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancelChanges = () => {
        setFormData({...originalFormData});
        setSaveError(null);
    };

    // PriceCharting form helper functions
    const isPriceChartingFormDirty = () => {
        return priceChartingApiKey !== originalPriceChartingApiKey;
    };

    const isPriceChartingFormValid = () => {
        // Allow saving both valid API keys and clearing (empty values)
        return true;
    };

    const canSavePriceCharting = () => {
        return isPriceChartingFormValid() && isPriceChartingFormDirty() && !priceChartingSaveLoading;
    };

    const handlePriceChartingApiKeyChange = (value: string) => {
        setPriceChartingApiKey(value);
        // Clear save error when user makes changes
        if (priceChartingSaveError) {
            setPriceChartingSaveError(null);
        }
    };

    const handleClearApiKey = () => {
        setPriceChartingApiKey("");
        // Clear save error when user makes changes
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

            // Update state to reflect successful save
            setOriginalPriceChartingApiKey(priceChartingApiKey);
            
            // Refresh global profile to reflect new connection status
            await refreshProfile();

            console.log('✅ PriceCharting API key saved successfully');
        } catch (error) {
            console.error('❌ Failed to save PriceCharting API key:', error);
            setPriceChartingSaveError(error instanceof Error ? error.message : 'Failed to save API key');
        } finally {
            setPriceChartingSaveLoading(false);
        }
    };

    const handleCancelPriceChartingChanges = () => {
        setPriceChartingApiKey(originalPriceChartingApiKey);
        setPriceChartingSaveError(null);
    };

    const publishPlatformMappings = async () => {
        try {
            setPublishingMappings(true);

            // Convert mappings to the required Mapping object format, filtering out null values
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
                console.log('No mappings to publish');
                return;
            }

            const platformApiService = createPlatformApiService(authService);
            await platformApiService.publishPlatformMappings(request);

            console.log(`✅ Published ${mappingsArray.length} platform mappings`);
        } catch (error) {
            console.error('Failed to publish platform mappings:', error);
        } finally {
            setPublishingMappings(false);
        }
    };

    const renderProfileTab = () => {
        if (profileLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    <span className="ml-3 text-gray-400">Loading profile...</span>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {/* Profile Status */}
                {profileNotFound && (
                    <div className="bg-amber-900/20 border border-amber-500/50 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400">ℹ️</span>
                            <div>
                                <p className="text-amber-400 font-medium">No Profile Information</p>
                                <p className="text-amber-300 text-sm mt-1">
                                    No profile information has been saved. Fill out the form below to create your
                                    profile.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Personal Information */}
                <div>
                    <h3 className="text-xl font-semibold text-white mb-6">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Name <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
                                placeholder="Enter your name"
                                className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                                    formData.name.trim().length === 0 && isFormDirty()
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-slate-600 focus:ring-cyan-500'
                                }`}
                            />
                            {formData.name.trim().length === 0 && isFormDirty() && (
                                <p className="text-red-400 text-sm mt-1">Name is required</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Favorite Game Title
                            </label>
                            <input
                                type="text"
                                value={formData.favoriteGame}
                                onChange={(e) => handleInputChange("favoriteGame", e.target.value)}
                                placeholder="Enter your favorite game"
                                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Error Display */}
                {saveError && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-red-400">❌</span>
                            <div>
                                <p className="text-red-400 font-medium">Failed to Save Profile</p>
                                <p className="text-red-300 text-sm mt-1">{saveError}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderPriceChartingTab = () => {
        return (
            <div className="space-y-8">
                {/* PriceCharting API Key */}
                <div>
                    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <TrendingUp className="w-5 h-5 text-cyan-400"/>
                                <span className="text-white font-medium">PriceCharting API</span>
                            </div>
                            <span className={`px-3 py-1 text-sm rounded-full ${
                                profile?.hasPriceChartingApiKey
                                    ? "bg-green-600 text-green-100"
                                    : "bg-red-600 text-red-100"
                            }`}>
                                {profile?.hasPriceChartingApiKey ? "Connected" : "Not Set"}
                            </span>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showApiKey ? "text" : "password"}
                                    value={priceChartingApiKey}
                                    onChange={(e) => handlePriceChartingApiKeyChange(e.target.value)}
                                    placeholder="Enter your PriceCharting API key"
                                    disabled={priceChartingSaveLoading}
                                    className="w-full px-4 py-3 pr-20 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        disabled={priceChartingSaveLoading}
                                        className="text-gray-400 hover:text-white disabled:opacity-50"
                                    >
                                        {showApiKey ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </button>
                                    {priceChartingApiKey && priceChartingApiKey !== "••••••••••••••••" && (
                                        <button
                                            type="button"
                                            onClick={() => navigator.clipboard.writeText(priceChartingApiKey)}
                                            disabled={priceChartingSaveLoading}
                                            className="text-gray-400 hover:text-white disabled:opacity-50"
                                            title="Copy API key"
                                        >
                                            <Copy className="w-4 h-4"/>
                                        </button>
                                    )}
                                </div>
                            </div>
                            {priceChartingApiKey && (
                                <button
                                    type="button"
                                    onClick={handleClearApiKey}
                                    disabled={priceChartingSaveLoading}
                                    className="text-sm text-red-400 hover:text-red-300 mt-2 disabled:opacity-50"
                                >
                                    Clear API key
                                </button>
                            )}
                            <p className="text-sm text-gray-400 mt-2">
                                Your API key is used to fetch current market prices for your games.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Error Display */}
                {priceChartingSaveError && (
                    <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-red-400">❌</span>
                            <div>
                                <p className="text-red-400 font-medium">Failed to Save API Key</p>
                                <p className="text-red-300 text-sm mt-1">{priceChartingSaveError}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
                    <button 
                        onClick={handleCancelPriceChartingChanges}
                        disabled={!isPriceChartingFormDirty() || priceChartingSaveLoading}
                        className="px-6 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSavePriceChartingApiKey}
                        disabled={!canSavePriceCharting()}
                        className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                    >
                        {priceChartingSaveLoading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        );
    };

    const renderIgdbTab = () => {
        // Sort platforms alphabetically by description
        const sortedPlatforms = [...platforms].sort((a, b) =>
            a.description.localeCompare(b.description)
        );

        // Get platform icon and color based on manufacturer/name
        const getPlatformIcon = (platform: Platform) => {
            const name = platform.description.toLowerCase();
            const manufacturer = platform.manufacturer.toLowerCase();

            if (manufacturer.includes('sony') || name.includes('playstation')) {
                return {icon: '🎮', color: 'text-blue-400'};
            }
            if (manufacturer.includes('microsoft') || name.includes('xbox')) {
                return {icon: '🎮', color: 'text-green-400'};
            }
            if (manufacturer.includes('nintendo')) {
                return {icon: '🎮', color: 'text-red-400'};
            }
            if (name.includes('pc') || name.includes('steam') || name.includes('windows')) {
                return {icon: '💻', color: 'text-gray-400'};
            }
            return {icon: '🎮', color: 'text-gray-300'};
        };

        // Sort IGDB platforms alphabetically by name
        const sortedIgdbPlatforms = [...igdbPlatforms].sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        if (platformsLoading || igdbPlatformsLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-400">
                        Loading platforms{platformsLoading && igdbPlatformsLoading ? '' : ' and IGDB mappings'}...
                    </div>
                </div>
            );
        }

        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white">Platform Mappings</h3>
                        <p className="text-gray-400 mt-2">
                            Map your platforms to their corresponding IGDB entries for better game matching.
                        </p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={publishPlatformMappings}
                            disabled={publishingMappings || Object.values(platformMappings).every(v => v === null)}
                            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors"
                            title="Publish platform mappings to server"
                        >
                            <Upload className={`w-4 h-4 ${publishingMappings ? 'animate-pulse' : ''}`}/>
                            <span>{publishingMappings ? 'Publishing...' : 'Publish Mappings'}</span>
                        </button>
                        <button
                            onClick={reloadPlatforms}
                            disabled={igdbPlatformsLoading}
                            className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors border border-slate-600"
                            title="Reload IGDB platforms (clears cache)"
                        >
                            <RotateCcw className={`w-4 h-4 ${igdbPlatformsLoading ? 'animate-spin' : ''}`}/>
                            <span>Reload Cache</span>
                        </button>
                    </div>
                </div>
                <div className="space-y-4">
                    {sortedPlatforms.map((platform) => {
                        const {icon, color} = getPlatformIcon(platform);
                        return (
                            <div key={platform.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className={`text-2xl ${color}`}>
                                            {icon}
                                        </span>
                                        <div>
                                            <span className="text-white font-medium">{platform.description}</span>
                                            <div className="text-sm text-gray-400">{platform.manufacturer}</div>
                                        </div>
                                    </div>
                                    <div className="w-64">
                                        <IgdbPlatformCombobox
                                            value={platformMappings[platform.id] || null}
                                            onChange={(igdbPlatform) => handlePlatformChange(platform.id, igdbPlatform)}
                                            platforms={sortedIgdbPlatforms}
                                            placeholder="Search IGDB platforms..."
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            {/* Tab Navigation */}
            <div className="border-b border-slate-700 mb-8">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab("profile")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "profile"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        Profile
                    </button>
                    <button
                        onClick={() => setActiveTab("pricecharting")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                            activeTab === "pricecharting"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        PriceCharting
                        <div className={`w-2 h-2 rounded-full ${
                            profile?.hasPriceChartingApiKey ? "bg-green-400" : "bg-red-400"
                        }`}></div>
                    </button>
                    <button
                        onClick={() => setActiveTab("igdb")}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === "igdb"
                                ? "border-cyan-400 text-cyan-400"
                                : "border-transparent text-gray-400 hover:text-gray-300"
                        }`}
                    >
                        IGDB
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="bg-slate-900 rounded-lg p-8">
                {activeTab === "profile" && renderProfileTab()}
                {activeTab === "pricecharting" && renderPriceChartingTab()}
                {activeTab === "igdb" && renderIgdbTab()}

                {/* Action Buttons - Only show for Profile tab */}
                {activeTab === "profile" && (
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-700">
                        <button
                            onClick={handleCancelChanges}
                            disabled={!isFormDirty() || saveLoading}
                            className="px-6 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveProfile}
                            disabled={!canSave()}
                            className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                        >
                            {saveLoading && (
                                <div
                                    className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            )}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}