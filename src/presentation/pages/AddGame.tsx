import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Loader2, FileText, Image, Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/common";
import { PlatformCombobox } from "../components/forms/PlatformCombobox";
import { useIgdbSearch } from "../hooks";
import type { Platform, IgdbGame } from "../../domain/models";
import { IgdbUtils } from "../../domain/models";

export const AddGame: React.FC = () => {
    const navigate = useNavigate();
    const [gameTitle, setGameTitle] = useState("");
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
    const [selectedGame, setSelectedGame] = useState<IgdbGame | null>(null);
    const [currentStep, setCurrentStep] = useState<'search' | 'configure'>('search');
    
    // Use IGDB search hook
    const { results: searchResults, loading: isSearching, error: searchError, hasSearched, searchGames, clearResults } = useIgdbSearch();


    // Auto-search when both fields are filled
    useEffect(() => {
        const performSearch = async () => {
            if (!selectedPlatform || !selectedPlatform.igdbPlatformId) return;
            
            setSelectedGame(null);
            // Use the platform's IGDB platform ID for more accurate matching
            await searchGames(gameTitle, selectedPlatform.igdbPlatformId);
        };

        const debounceTimer = setTimeout(() => {
            if (gameTitle.trim() && selectedPlatform && selectedPlatform.igdbPlatformId) {
                performSearch();
            } else {
                clearResults();
                setSelectedGame(null);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [gameTitle, selectedPlatform, clearResults, searchGames]);

    const handleGameSelect = (game: IgdbGame) => {
        setSelectedGame(game);
    };

    const canContinue = currentStep === 'search' 
        ? (selectedGame !== null && gameTitle.trim() && selectedPlatform && selectedPlatform.igdbPlatformId)
        : selectedGame !== null;

    const handleContinue = () => {
        if (canContinue) {
            setCurrentStep('configure');
        }
    };

    const handleContinueWithoutLinking = () => {
        // Use the current form data to create a manual game entry
        const manualGame: IgdbGame = {
            id: -1, // Use negative ID to indicate manual entry
            name: gameTitle,
            summary: undefined,
            platforms: selectedPlatform ? [{ name: selectedPlatform.description }] : [],
            genres: [],
            themes: []
        };
        setSelectedGame(manualGame);
        setCurrentStep('configure');
    };

    const handleBackToSearch = () => {
        setCurrentStep('search');
        setSelectedGame(null); // Clear selection when going back to search
    };

    const handleSaveGame = () => {
        console.log('Saving game:', selectedGame);
        // TODO: Save game to collection
        navigate('/collection');
    };


    const breadcrumbItems = [
        { label: "My Collection", path: "/collection" },
        { label: "Add New Game", path: "" }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">Add New Game</h1>
                <p className="text-gray-400">
                    {currentStep === 'search' ? 'Search IGDB for game information' : 'Configure game details'}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: currentStep === 'search' ? '25%' : '75%' }}
                    ></div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
                {currentStep === 'search' ? (
                    /* Search Step */
                    <div>
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-6">Search Game Database</h2>
                        
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Game Title Input */}
                                <div>
                                    <label htmlFor="gameTitle" className="block text-sm font-medium text-gray-300 mb-2">
                                        Game Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="gameTitle"
                                        type="text"
                                        placeholder="Enter game title..."
                                        value={gameTitle}
                                        onChange={(e) => setGameTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg
                                                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                                   focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                        aria-required="true"
                                    />
                                </div>

                                {/* Platform Typeahead */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Platform <span className="text-red-400">*</span>
                                    </label>
                                    <PlatformCombobox
                                        value={selectedPlatform}
                                        onChange={setSelectedPlatform}
                                        placeholder="Search for a platform..."
                                    />
                                </div>
                            </div>

                            {/* Helper Text */}
                            <p className="text-gray-400 text-sm mb-4">
                                Search will begin automatically when both title and platform are provided. Platform must have IGDB mapping configured.
                            </p>

                            {/* IGDB Mapping Warning */}
                            {selectedPlatform && !selectedPlatform.igdbPlatformId && (
                                <div className="bg-amber-900/20 border border-amber-500 rounded-lg p-4 mb-4">
                                    <p className="text-amber-400 text-sm">
                                        <strong>Platform not mapped:</strong> "{selectedPlatform.description}" doesn't have IGDB mapping configured. 
                                        Please configure the platform mapping in Settings to enable game search.
                                    </p>
                                </div>
                            )}
                        </div>

                {/* Search Results Section */}
                {(isSearching || hasSearched) && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Search Results</h3>
                            {hasSearched && !isSearching && (
                                <span className="text-gray-400 text-sm">
                                    {searchResults.length} results found
                                </span>
                            )}
                        </div>

                        {/* Loading State */}
                        {isSearching && (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                                    <p className="text-gray-400">Searching IGDB...</p>
                                </div>
                            </div>
                        )}

                        {/* Search Error */}
                        {!isSearching && searchError && (
                            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 text-center">
                                <p className="text-red-400 mb-1">Search failed</p>
                                <p className="text-red-300 text-sm">{searchError}</p>
                            </div>
                        )}

                        {/* Search Results */}
                        {!isSearching && hasSearched && !searchError && (
                            <div className="space-y-3">
                                {searchResults.length === 0 ? (
                                    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-8 text-center">
                                        <FileText className="mx-auto text-gray-500 mb-3" size={48} />
                                        <p className="text-gray-400 mb-1">No games found</p>
                                        <p className="text-gray-500 text-sm">Try adjusting your search terms or continue without linking</p>
                                    </div>
                                ) : (
                                    searchResults.map((game) => {
                                        const allTags = IgdbUtils.getAllTags(game);
                                        const platformNames = IgdbUtils.getPlatformNames(game.platforms);
                                        
                                        return (
                                            <div
                                                key={game.id}
                                                onClick={() => handleGameSelect(game)}
                                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                                                    selectedGame?.id === game.id
                                                        ? 'border-cyan-500 bg-cyan-500/10'
                                                        : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500'
                                                }`}
                                            >
                                                {/* Game Cover */}
                                                <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                                    🎮
                                                </div>

                                                {/* Game Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium mb-1">{game.name}</h4>
                                                    <p className="text-gray-400 text-sm mb-2">
                                                        {platformNames.join(', ')}
                                                    </p>
                                                    {allTags.length > 0 && (
                                                        <div className="flex gap-2 flex-wrap">
                                                            {allTags.slice(0, 3).map((tag: string) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {allTags.length > 3 && (
                                                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-600 text-gray-300">
                                                                    +{allTags.length - 3} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Selection Indicator */}
                                                {selectedGame?.id === game.id && (
                                                    <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                )}

                        {/* Bottom Section */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                            {/* Continue without linking */}
                            <button
                                onClick={handleContinueWithoutLinking}
                                disabled={!gameTitle.trim() || !selectedPlatform || !selectedPlatform.igdbPlatformId}
                                className={`text-sm transition-colors ${
                                    gameTitle.trim() && selectedPlatform && selectedPlatform.igdbPlatformId
                                        ? 'text-gray-400 hover:text-white cursor-pointer'
                                        : 'text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                Continue without linking
                            </button>

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                disabled={!canContinue}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                    canContinue
                                        ? 'bg-cyan-500 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800'
                                        : 'bg-slate-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Continue
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Configure Step */
                    <div>
                        {/* Game Info Header */}
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-20 h-20 bg-slate-600 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 border border-slate-500">
                                🎮
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedGame?.name}</h2>
                                <p className="text-gray-400 mb-3">
                                    {selectedGame?.platforms ? IgdbUtils.getPlatformNames(selectedGame.platforms).join(', ') : 'Unknown Platform'}
                                </p>
                                {selectedGame && IgdbUtils.getAllTags(selectedGame).length > 0 && (
                                    <div className="flex gap-2 flex-wrap">
                                        {IgdbUtils.getAllTags(selectedGame).map((tag: string) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 rounded text-xs font-medium bg-blue-600 text-white"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detail Tab */}
                        <div className="mb-8">
                            <div className="border-b border-slate-600">
                                <div className="flex">
                                    <button className="px-4 py-3 text-cyan-400 border-b-2 border-cyan-400 font-medium">
                                        Detail
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Synopsis Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Synopsis</h3>
                            {selectedGame?.summary ? (
                                <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                                    <p className="text-gray-300 leading-relaxed">{selectedGame.summary}</p>
                                </div>
                            ) : (
                                <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-8 text-center">
                                    <FileText className="mx-auto text-gray-500 mb-3" size={48} />
                                    <p className="text-gray-400 mb-1">No synopsis available</p>
                                    <p className="text-gray-500 text-sm">Add game details manually or link with IGDB</p>
                                </div>
                            )}
                        </div>

                        {/* Screenshots Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Screenshots</h3>
                                <button className="flex items-center gap-2 px-3 py-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                                    <Plus size={16} />
                                    Add Screenshot
                                </button>
                            </div>
                            {/* Keep placeholder screenshots for now as IGDB response doesn't include them */}
                            <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-8 text-center">
                                <Image className="mx-auto text-gray-500 mb-3" size={48} />
                                <p className="text-gray-400 mb-1">No screenshots available</p>
                                <p className="text-gray-500 text-sm">Upload screenshots to showcase the game</p>
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                            <button
                                onClick={handleBackToSearch}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to Search
                            </button>

                            <button
                                onClick={handleSaveGame}
                                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors font-medium"
                            >
                                <Save size={16} />
                                Save Game
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};