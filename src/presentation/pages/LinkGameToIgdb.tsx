import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronRight, Loader2, FileText, Link as LinkIcon } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Breadcrumb } from "../components/common";
import { useIgdbSearch } from "../hooks";
import type { IgdbGame, Game } from "../../domain/models";
import { IgdbUtils } from "../../domain/models";
import { createGameApiService } from "../../infrastructure/api";
import { useAuthService } from "../hooks/useAuthService";

export const LinkGameToIgdb: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { gameId } = useParams<{ gameId: string }>();
    const authService = useAuthService();
    
    // Get search parameters from navigation state
    const searchParams = location.state as { 
        gameTitle?: string; 
        igdbPlatformId?: number; 
        platformName?: string; 
    } | undefined;
    
    // Game data state
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // IGDB search state
    const [selectedGame, setSelectedGame] = useState<IgdbGame | null>(null);
    const [currentStep, setCurrentStep] = useState<'search' | 'confirm'>('search');
    
    // Linking state
    const [isLinking, setIsLinking] = useState(false);
    const [linkError, setLinkError] = useState<string | null>(null);
    
    // Use IGDB search hook
    const { results: searchResults, loading: isSearching, error: searchError, hasSearched, searchGames } = useIgdbSearch();
    
    // Track if we've already initiated the search to prevent duplicates
    const hasInitiatedSearch = useRef(false);

    // Load game data for display (breadcrumbs, etc.)
    useEffect(() => {
        async function loadGameData() {
            if (!gameId || !authService.isAuthenticated || authService.isLoading) {
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const gameApiService = createGameApiService(authService);
                
                console.log('🎮 Loading game details for linking:', gameId);
                const gameData = await gameApiService.getGameById(gameId);
                
                if (gameData) {
                    setGame(gameData);
                    console.log('✅ Game data loaded:', gameData);
                } else {
                    setError('Game not found');
                }
            } catch (err) {
                console.error('❌ Failed to load game:', err);
                setError(err instanceof Error ? err.message : 'Failed to load game');
            } finally {
                setLoading(false);
            }
        }

        loadGameData();
    }, [gameId, authService.isAuthenticated]);

    // Auto-search using parameters from navigation state or fallback to game data
    useEffect(() => {
        const performSearch = async () => {
            const title = searchParams?.gameTitle || game?.description;
            const platformId = searchParams?.igdbPlatformId || game?.platform.igdbPlatformId;
            
            if (title && platformId && currentStep === 'search' && !hasInitiatedSearch.current) {
                hasInitiatedSearch.current = true;
                console.log('🔍 Auto-searching IGDB for:', title, 'on platform:', platformId);
                await searchGames(title, platformId);
            }
        };

        performSearch();
    }, [searchParams, game, currentStep, searchGames]);

    const handleGameSelect = (igdbGame: IgdbGame) => {
        setSelectedGame(igdbGame);
    };

    const canContinue = currentStep === 'search' 
        ? selectedGame !== null && (searchParams?.igdbPlatformId !== undefined && searchParams?.igdbPlatformId !== null)
        : selectedGame !== null;

    const handleContinue = () => {
        if (canContinue) {
            setCurrentStep('confirm');
        }
    };

    const handleBackToSearch = () => {
        setCurrentStep('search');
        setSelectedGame(null);
        // Reset search initiation flag to allow re-searching if needed
        hasInitiatedSearch.current = false;
    };

    const handleLinkGame = async () => {
        if (!selectedGame || !gameId) {
            console.error('Missing required data for linking game');
            return;
        }

        try {
            setIsLinking(true);
            setLinkError(null);

            const gameApiService = createGameApiService(authService);
            
            console.log('🔗 Linking game:', gameId, 'to IGDB game:', selectedGame.id);
            
            // Make the actual API call to link the game
            await gameApiService.linkGameToIgdb(gameId, {
                igdbGameId: selectedGame.id
            });
            
            console.log('✅ Game linked successfully');
            navigate(`/collection/game/${gameId}`);
        } catch (error) {
            console.error('❌ Failed to link game:', error);
            setLinkError(error instanceof Error ? error.message : 'Failed to link game');
        } finally {
            setIsLinking(false);
        }
    };

    const breadcrumbItems = [
        { label: "My Collection", path: "/collection" },
        { label: game?.description || "Loading...", path: `/collection/game/${gameId}` },
        { label: "Link to IGDB", path: "" }
    ];

    if (loading) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <Breadcrumb items={breadcrumbItems} />
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    <span className="ml-3 text-gray-400">Loading game details...</span>
                </div>
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <Breadcrumb items={breadcrumbItems} />
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
                    <p className="text-red-400 font-medium">Failed to load game</p>
                    <p className="text-red-300 text-sm mt-1">{error || 'Game not found'}</p>
                    <button
                        onClick={() => navigate(`/collection/game/${gameId}`)}
                        className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                    >
                        Back to Game
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">Link Game to IGDB</h1>
                <p className="text-gray-400">
                    {currentStep === 'search' ? 'Search IGDB to enhance game details' : 'Confirm IGDB link'}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: currentStep === 'search' ? '50%' : '100%' }}
                    ></div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
                {currentStep === 'search' ? (
                    /* Search Step */
                    <div>
                        {/* Current Game Info */}
                        <div className="mb-8 bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Current Game Details</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                    🎮
                                </div>
                                <div>
                                    <h3 className="text-white font-medium text-lg">
                                        {searchParams?.gameTitle || game?.description || 'Loading...'}
                                    </h3>
                                    <p className="text-gray-400">
                                        {searchParams?.platformName || game?.platform.description || 'Loading...'}
                                    </p>
                                    {game?.publisher && (
                                        <p className="text-gray-500 text-sm">{game.publisher.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* IGDB Platform Mapping Warning */}
                        {(searchParams?.igdbPlatformId === undefined || searchParams?.igdbPlatformId === null) && (
                            <div className="mb-8">
                                <div className="bg-amber-900/20 border border-amber-500 rounded-lg p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-xl">⚠</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-amber-400 font-semibold text-lg mb-2">Platform Mapping Required</h3>
                                            <p className="text-amber-300 mb-4">
                                                The platform "{searchParams?.platformName || game?.platform.description}" doesn't have IGDB mapping configured. 
                                                Platform mapping is required to search IGDB and link games.
                                            </p>
                                            
                                            <div className="bg-amber-800/30 rounded-lg p-4 mb-4">
                                                <div className="flex items-center gap-2 text-cyan-400 mb-3">
                                                    <span className="text-cyan-400">ℹ</span>
                                                    <span className="font-medium">How to Fix This</span>
                                                </div>
                                                <ul className="text-amber-200 text-sm space-y-1">
                                                    <li>• Go to Settings to configure platform IGDB mappings</li>
                                                    <li>• Map "{searchParams?.platformName || game?.platform.description}" to its corresponding IGDB platform ID</li>
                                                    <li>• Return here to link this game to IGDB</li>
                                                </ul>
                                            </div>
                                            
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={() => navigate('/settings')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
                                                >
                                                    <span>⚙️</span>
                                                    Go to Settings
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/collection/game/${gameId}`)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-gray-300 rounded-lg hover:bg-slate-500 hover:text-white transition-colors text-sm font-medium"
                                                >
                                                    <ArrowLeft size={16} />
                                                    Back to Game
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* IGDB Search Results Section - Only show if platform mapping exists */}
                        {(searchParams?.igdbPlatformId !== undefined && searchParams?.igdbPlatformId !== null) && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">IGDB Search Results</h3>
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
                                            <p className="text-gray-400 mb-1">No matching games found</p>
                                            <p className="text-gray-500 text-sm">No IGDB entries match this game title and platform</p>
                                        </div>
                                    ) : (
                                        searchResults.map((igdbGame) => {
                                            const allTags = IgdbUtils.getAllTags(igdbGame);
                                            const platformNames = IgdbUtils.getPlatformNames(igdbGame.platforms);
                                            
                                            return (
                                                <div
                                                    key={igdbGame.id}
                                                    onClick={() => handleGameSelect(igdbGame)}
                                                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                                                        selectedGame?.id === igdbGame.id
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
                                                        <h4 className="text-white font-medium mb-1">{igdbGame.name}</h4>
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
                                                    {selectedGame?.id === igdbGame.id && (
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
                            {/* Cancel */}
                            <button
                                onClick={() => navigate(`/collection/game/${gameId}`)}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Cancel
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
                    /* Confirm Step */
                    <div>
                        {/* Linking Preview */}
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-6">Link Confirmation</h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Current Game */}
                                <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                                    <h3 className="text-lg font-medium text-white mb-4">Current Game</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                            🎮
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">
                                                {searchParams?.gameTitle || game?.description || 'Loading...'}
                                            </h4>
                                            <p className="text-gray-400 text-sm">
                                                {searchParams?.platformName || game?.platform.description || 'Loading...'}
                                            </p>
                                            {game?.publisher && (
                                                <p className="text-gray-500 text-sm">{game.publisher.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                        <p>• Limited details available</p>
                                        <p>• No synopsis or screenshots</p>
                                    </div>
                                </div>

                                {/* IGDB Game */}
                                <div className="bg-cyan-500/10 rounded-lg border border-cyan-500/30 p-6">
                                    <h3 className="text-lg font-medium text-white mb-4">IGDB Game</h3>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                            🎮
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium">{selectedGame?.name}</h4>
                                            <p className="text-gray-400 text-sm">
                                                {selectedGame?.platforms ? IgdbUtils.getPlatformNames(selectedGame.platforms).join(', ') : 'Unknown Platform'}
                                            </p>
                                            {selectedGame && IgdbUtils.getAllTags(selectedGame).length > 0 && (
                                                <div className="flex gap-2 flex-wrap mt-2">
                                                    {IgdbUtils.getAllTags(selectedGame).slice(0, 3).map((tag: string) => (
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
                                    <div className="text-cyan-300 text-sm">
                                        <p>• Enhanced game details</p>
                                        <p>• Synopsis and screenshots</p>
                                        <p>• Rich metadata from IGDB</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Synopsis Preview */}
                        {selectedGame?.summary && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-white mb-4">Synopsis Preview</h3>
                                <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                                    <p className="text-gray-300 leading-relaxed">{selectedGame.summary}</p>
                                </div>
                            </div>
                        )}

                        {/* Link Error */}
                        {linkError && (
                            <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
                                <p className="text-red-400 font-medium">Failed to link game</p>
                                <p className="text-red-300 text-sm mt-1">{linkError}</p>
                            </div>
                        )}

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                            <button
                                onClick={handleBackToSearch}
                                disabled={isLinking}
                                className={`flex items-center gap-2 transition-colors ${
                                    isLinking 
                                        ? 'text-gray-600 cursor-not-allowed' 
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <ArrowLeft size={16} />
                                Back to Search
                            </button>

                            <button
                                onClick={handleLinkGame}
                                disabled={isLinking}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors font-medium ${
                                    isLinking
                                        ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-cyan-500 text-white hover:bg-cyan-600'
                                }`}
                            >
                                {isLinking ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        Linking...
                                    </>
                                ) : (
                                    <>
                                        <LinkIcon size={16} />
                                        Link Game
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};