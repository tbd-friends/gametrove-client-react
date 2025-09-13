import React, { useState } from "react";
import { ProfileTab, PriceChartingTab, IgdbTab } from "../components/settings";
import { useSettingsData } from "../hooks/useSettingsData";

type TabType = "profile" | "pricecharting" | "igdb";

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>("profile");
    const settingsData = useSettingsData();

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
                            settingsData.profile?.hasPriceChartingApiKey ? "bg-green-400" : "bg-red-400"
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
                {activeTab === "profile" && (
                    <>
                        <ProfileTab
                            profile={settingsData.profile}
                            profileLoading={settingsData.profileLoading}
                            profileNotFound={settingsData.profileNotFound}
                            formData={settingsData.formData}
                            saveLoading={settingsData.saveLoading}
                            saveError={settingsData.saveError}
                            isFormDirty={settingsData.isFormDirty()}
                            onInputChange={settingsData.handleInputChange}
                        />
                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-slate-700">
                            <button
                                onClick={settingsData.handleCancelChanges}
                                disabled={!settingsData.isFormDirty() || settingsData.saveLoading}
                                className="px-6 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={settingsData.handleSaveProfile}
                                disabled={!settingsData.canSave()}
                                className="flex items-center gap-2 px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                            >
                                {settingsData.saveLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                )}
                                Save Changes
                            </button>
                        </div>
                    </>
                )}
                {activeTab === "pricecharting" && (
                    <PriceChartingTab
                        profile={settingsData.profile}
                        priceChartingApiKey={settingsData.priceChartingApiKey}
                        showApiKey={settingsData.showApiKey}
                        priceChartingSaveLoading={settingsData.priceChartingSaveLoading}
                        priceChartingSaveError={settingsData.priceChartingSaveError}
                        triggerUpdateLoading={settingsData.triggerUpdateLoading}
                        triggerUpdateError={settingsData.triggerUpdateError}
                        triggerUpdateSuccess={settingsData.triggerUpdateSuccess}
                        isPriceChartingFormDirty={settingsData.isPriceChartingFormDirty()}
                        canSavePriceCharting={settingsData.canSavePriceCharting()}
                        onApiKeyChange={settingsData.handlePriceChartingApiKeyChange}
                        onToggleShowApiKey={settingsData.handleToggleShowApiKey}
                        onClearApiKey={settingsData.handleClearApiKey}
                        onCancelChanges={settingsData.handleCancelPriceChartingChanges}
                        onSaveApiKey={settingsData.handleSavePriceChartingApiKey}
                        onTriggerUpdate={settingsData.handleTriggerPriceUpdate}
                    />
                )}
                {activeTab === "igdb" && (
                    <IgdbTab
                        platforms={settingsData.platforms}
                        igdbPlatforms={settingsData.igdbPlatforms}
                        platformsLoading={settingsData.platformsLoading}
                        igdbPlatformsLoading={settingsData.igdbPlatformsLoading}
                        platformMappings={settingsData.platformMappings}
                        publishingMappings={settingsData.publishingMappings}
                        onPlatformChange={settingsData.handlePlatformChange}
                        onPublishMappings={settingsData.handlePublishMappings}
                        onReloadPlatforms={settingsData.handleReloadPlatforms}
                    />
                )}
            </div>
        </div>
    );
}