import React, { useState } from "react";
import { TrendingUp, Eye, EyeOff, Copy } from "lucide-react";

type TabType = "profile" | "igdb";

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const [showApiKey, setShowApiKey] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "Terry Burns-Dyson",
        favoriteGame: "",
        priceChartingApiKey: "••••••••••••••••"
    });

    const [platformMappings, setPlatformMappings] = useState({
        playstation5: "PlayStation 5",
        xboxSeriesX: "Xbox Series X",
        nintendoSwitch: "Nintendo Switch",
        pcSteam: "PC (Microsoft Windows)",
        playstation4: "PlayStation 4",
        xboxOne: "Xbox One"
    });

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
        const platforms = [
            { key: "playstation5", name: "PlayStation 5", icon: "🎮", color: "text-blue-400" },
            { key: "xboxSeriesX", name: "Xbox Series X", icon: "🎮", color: "text-green-400" },
            { key: "nintendoSwitch", name: "Nintendo Switch", icon: "🎮", color: "text-red-400" },
            { key: "pcSteam", name: "PC (Steam)", icon: "💻", color: "text-gray-400" },
            { key: "playstation4", name: "PlayStation 4", icon: "🎮", color: "text-blue-400" },
            { key: "xboxOne", name: "Xbox One", icon: "🎮", color: "text-green-400" }
        ];

        const platformOptions = [
            "PlayStation 5",
            "Xbox Series X",
            "Nintendo Switch",
            "PC (Microsoft Windows)",
            "PC (Steam)",
            "PlayStation 4",
            "Xbox One",
            "Nintendo 3DS",
            "PlayStation Vita"
        ];

        return (
            <div>
                <h3 className="text-xl font-semibold text-white mb-6">Platforms</h3>
                <div className="space-y-4">
                    {platforms.map((platform) => (
                        <div key={platform.key} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <span className={`text-2xl ${platform.color}`}>
                                        {platform.icon}
                                    </span>
                                    <span className="text-white font-medium">{platform.name}</span>
                                </div>
                                <div className="w-64">
                                    <select
                                        value={platformMappings[platform.key as keyof typeof platformMappings]}
                                        onChange={(e) => handlePlatformChange(platform.key, e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    >
                                        {platformOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    ))}
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