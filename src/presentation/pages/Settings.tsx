import React, { useState } from "react";
import { TrendingUp, Eye, EyeOff, Copy, RotateCcw } from "lucide-react";
import { usePlatforms, useIgdbPlatforms } from "../hooks";

type TabType = "profile" | "igdb";

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [showApiKey, setShowApiKey] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "Terry Burns-Dyson",
        favoriteGame: "",
        priceChartingApiKey: "••••••••••••••••"
    });

    const { platforms, loading: platformsLoading } = usePlatforms();
    const { platforms: igdbPlatforms, loading: igdbPlatformsLoading, reloadPlatforms } = useIgdbPlatforms();
    
    // Initialize platform mappings based on loaded platforms
    const [platformMappings, setPlatformMappings] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePlatformChange = (platform: string, value: string) => {
        setPlatformMappings(prev => ({ ...prev, [platform]: value }));
    };

    const renderProfileTab = () => (
        <div className="space-y-8">
            {/* Personal Information */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-6">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => handleInputChange("fullName", e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
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

            {/* 3rd Party Links */}
            <div>
                <h3 className="text-xl font-semibold text-white mb-6">3rd Party Links</h3>
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            <span className="text-white font-medium">PriceCharting</span>
                        </div>
                        <span className="px-3 py-1 bg-green-600 text-green-100 text-sm rounded-full">
                            Connected
                        </span>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            API Key
                        </label>
                        <div className="relative">
                            <input
                                type={showApiKey ? "text" : "password"}
                                value={formData.priceChartingApiKey}
                                onChange={(e) => handleInputChange("priceChartingApiKey", e.target.value)}
                                className="w-full px-4 py-3 pr-20 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
                                <button
                                    type="button"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-white"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">
                            Your API key is used to fetch current market prices for your games.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderIgdbTab = () => {
        // Sort platforms alphabetically by description
        const sortedPlatforms = [...platforms].sort((a, b) => 
            a.description.localeCompare(b.description)
        );

        // Get platform icon and color based on manufacturer/name
        const getPlatformIcon = (platform: any) => {
            const name = platform.description.toLowerCase();
            const manufacturer = platform.manufacturer.toLowerCase();
            
            if (manufacturer.includes('sony') || name.includes('playstation')) {
                return { icon: '🎮', color: 'text-blue-400' };
            }
            if (manufacturer.includes('microsoft') || name.includes('xbox')) {
                return { icon: '🎮', color: 'text-green-400' };
            }
            if (manufacturer.includes('nintendo')) {
                return { icon: '🎮', color: 'text-red-400' };
            }
            if (name.includes('pc') || name.includes('steam') || name.includes('windows')) {
                return { icon: '💻', color: 'text-gray-400' };
            }
            return { icon: '🎮', color: 'text-gray-300' };
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
                    <button
                        onClick={reloadPlatforms}
                        disabled={igdbPlatformsLoading}
                        className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:opacity-50 text-white rounded-lg transition-colors border border-slate-600"
                        title="Reload IGDB platforms (clears cache)"
                    >
                        <RotateCcw className={`w-4 h-4 ${igdbPlatformsLoading ? 'animate-spin' : ''}`} />
                        <span>Reload Cache</span>
                    </button>
                </div>
                <div className="space-y-4">
                    {sortedPlatforms.map((platform) => {
                        const { icon, color } = getPlatformIcon(platform);
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
                                        <select
                                            value={platformMappings[platform.id] || ''}
                                            onChange={(e) => handlePlatformChange(platform.id, e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value="">Select IGDB Platform...</option>
                                            {sortedIgdbPlatforms.map((igdbPlatform) => {
                                                let displayText = igdbPlatform.name;
                                                if (igdbPlatform.alternativeName) {
                                                    displayText += ` (${igdbPlatform.alternativeName})`;
                                                } else if (igdbPlatform.abbreviation) {
                                                    displayText += ` (${igdbPlatform.abbreviation})`;
                                                }
                                                
                                                return (
                                                    <option key={igdbPlatform.id} value={igdbPlatform.name}>
                                                        {displayText}
                                                    </option>
                                                );
                                            })}
                                        </select>
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
                {activeTab === "profile" ? renderProfileTab() : renderIgdbTab()}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-700">
                    <button className="px-6 py-2 text-gray-300 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}