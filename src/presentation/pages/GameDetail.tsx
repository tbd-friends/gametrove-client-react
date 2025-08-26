import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, Edit, Edit3, Trash2, AlertCircle, Link } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Breadcrumb } from "../components/common";
import { PlatformCombobox } from "../components/forms/PlatformCombobox";
import { slugToDisplayName } from "../utils/slugUtils";
import { createGameApiService, createIgdbApiService } from "../../infrastructure/api";
import type { IgdbGameDetails } from "../../infrastructure/api/IgdbApiService";
import { useAuthService } from "../hooks/useAuthService";
import type { Game, Platform } from "../../domain/models";
import { mapApiConditionToGameCondition } from "../../domain/models/GameCopy";

export const GameDetail: React.FC = () => {
    const navigate = useNavigate();
    const { gameId, consoleName } = useParams<{ gameId: string; consoleName?: string }>();
    const [activeTab, setActiveTab] = useState<'details' | 'copies'>('details');
    const [game, setGame] = useState<Game | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // IGDB details state
    const [igdbDetails, setIgdbDetails] = useState<IgdbGameDetails | null>(null);
    const [igdbLoading, setIgdbLoading] = useState(false);
    const [igdbError, setIgdbError] = useState<string | null>(null);
    
    // Edit dialog state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        publisher: ''
    });
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
    
    const authService = useAuthService();

    // Load game data from API
    useEffect(() => {
        async function loadGameData() {
            if (!gameId || !authService.isAuthenticated || authService.isLoading) {
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const gameApiService = createGameApiService(authService);
                
                console.log('🎮 Loading game details for ID:', gameId);
                const gameData = await gameApiService.getGameById(gameId);
                
                if (gameData) {
                    setGame(gameData);
                    // Initialize edit form with current game data
                    setEditForm({
                        title: gameData.description,
                        publisher: gameData.publisher?.description || ''
                    });
                    setSelectedPlatform(gameData.platform);
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

    // Load IGDB details when game has igdbGameId
    useEffect(() => {
        async function loadIgdbDetails() {
            if (!game?.igdbGameId || !authService.isAuthenticated || authService.isLoading) {
                return;
            }

            try {
                setIgdbLoading(true);
                setIgdbError(null);

                const igdbApiService = createIgdbApiService(authService);
                const details = await igdbApiService.getGameDetails(game.igdbGameId);
                
                setIgdbDetails(details);
                console.log('✅ Loaded IGDB details:', details);
            } catch (err) {
                console.error('❌ Failed to load IGDB details:', err);
                setIgdbError(err instanceof Error ? err.message : 'Failed to load IGDB details');
            } finally {
                setIgdbLoading(false);
            }
        }

        loadIgdbDetails();
    }, [game?.igdbGameId, authService.isAuthenticated]);

    // Merge real game data with placeholder data where needed
    const displayData = React.useMemo(() => {
        if (!game) return null;
        
        // Calculate total estimated value from copies
        const totalEstimatedValue = game.copies 
            ? game.copies.reduce((sum, copy) => sum + (copy.estimatedValue || 0), 0)
            : 0;

        return {
            // Real data from API
            id: game.id,
            title: game.description, // API uses 'description' for game title
            platform: game.platform.description,
            publisher: game.publisher?.description || "Unknown Publisher",
            totalCopies: game.copyCount,
            estimatedValue: totalEstimatedValue,
            copies: game.copies || [],
            
            // Placeholder data for missing fields
            developer: "Unknown Developer", // TODO: Add when available in API
            year: new Date().getFullYear(), // TODO: Parse from API when available
            rating: 4.8,
            reviewCount: 245,
            esrb: "E",
            genres: [
                ...(igdbDetails?.genres?.map(g => g.name) || []),
                ...(igdbDetails?.themes?.map(t => t.name) || [])
            ].filter(Boolean).slice(0, 6),
            synopsis: igdbDetails?.summary || "Game details coming soon. This information will be available once we integrate with external game databases.",
            coverImage: "🎮",
            screenshots: igdbDetails?.screenshots?.map((screenshot, index) => ({
                id: index + 1,
                url: `https:${screenshot.url}`,
                title: `Screenshot ${index + 1}`,
                width: screenshot.width,
                height: screenshot.height
            })) || [
                { id: 1, url: "🌴", title: "Screenshot 1" },
                { id: 2, url: "❄️", title: "Screenshot 2" },
                { id: 3, url: "🏜️", title: "Screenshot 3" },
                { id: 4, url: "🌊", title: "Screenshot 4" }
            ],
            releaseDate: "Release date coming soon",
            dateAdded: game.copies && game.copies.length > 0 
                ? new Date(game.copies[0].purchasedDate).toLocaleDateString('en-US', { 
                    year: 'numeric', month: 'long', day: 'numeric' 
                })
                : "Unknown",
            condition: game.copies && game.copies.length > 0
                ? mapApiConditionToGameCondition(game.copies[0].condition)
                : "Unknown"
        };
    }, [game, igdbDetails]);

    // Create breadcrumbs based on routing context
    const breadcrumbItems = React.useMemo(() => {
        const gameTitle = displayData?.title || "Loading...";
        
        return consoleName
            ? [
                { label: "My Collection", path: "/collection" },
                { label: slugToDisplayName(consoleName), path: `/collection/console/${consoleName}` },
                { label: gameTitle, path: "" }
            ]
            : [
                { label: "My Collection", path: "/collection" },
                { label: gameTitle, path: "" }
            ];
    }, [consoleName, displayData?.title]);

    const handleEditGame = () => {
        // Ensure form is populated with current game data when dialog opens
        if (game) {
            setEditForm({
                title: game.description,
                publisher: game.publisher?.description || ''
            });
            setSelectedPlatform(game.platform);
        }
        setIsEditDialogOpen(true);
    };

    const handleEditFormChange = (field: keyof typeof editForm, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditSubmit = () => {
        // TODO: Implement API call to update game
        console.log("Updating game with:", {
            ...editForm,
            platform: selectedPlatform
        });
        setIsEditDialogOpen(false);
    };

    const handleEditCancel = () => {
        // Reset form to original values
        if (game) {
            setEditForm({
                title: game.description,
                publisher: game.publisher?.description || ''
            });
            setSelectedPlatform(game.platform);
        }
        setIsEditDialogOpen(false);
    };

    const handleRemoveFromCollection = () => {
        // Show confirmation dialog and remove game
        if (window.confirm(`Are you sure you want to remove "${displayData?.title}" from your collection?`)) {
            console.log("Remove game:", displayData?.id);
            if (consoleName) {
                navigate(`/collection/console/${consoleName}`);
            } else {
                navigate('/collection');
            }
        }
    };

    const handleLinkToIgdb = () => {
        if (gameId && game) {
            navigate(`/collection/game/${gameId}/link-igdb`, {
                state: { 
                    gameTitle: game.description,
                    igdbPlatformId: game.platform.igdbPlatformId, // May be undefined for older games
                    platformName: game.platform.description
                }
            });
        }
    };

    return (
        <div className="w-full">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    <span className="ml-3 text-gray-400">Loading game details...</span>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="text-red-400 font-medium">Failed to load game</h3>
                        <p className="text-gray-300 text-sm mt-1">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Game Content - Only show when we have data */}
            {displayData && !loading && !error && (
                <>
                    {/* Game Header */}
                    <div className="flex items-start gap-6 mb-8">
                        {/* Game Cover */}
                        <div className="w-48 h-64 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-6xl flex-shrink-0 relative">
                            {displayData.coverImage}
                            {/* ESRB Rating Badge */}
                            <div className="absolute top-2 left-2 bg-slate-900 border border-slate-600 rounded px-2 py-1">
                                <span className="text-white text-xs font-bold">ESRB: {displayData.esrb}</span>
                            </div>
                        </div>

                        {/* Game Info */}
                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold text-white">{displayData.title}</h1>
                                    <button
                                        onClick={handleEditGame}
                                        className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                        title="Edit game details"
                                    >
                                        <Edit3 size={20} />
                                    </button>
                                </div>
                                {!game?.igdbGameId && (
                                    <button
                                        onClick={handleLinkToIgdb}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
                                    >
                                        <Link size={16} />
                                        Link to IGDB
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-400 text-lg mb-4">
                                {displayData.platform} • {displayData.publisher} • {displayData.year}
                            </p>
                    
                            {/* Genre Tags */}
                            {displayData.genres.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {displayData.genres.map((genre, index) => {
                                    // Generate consistent colors based on genre name hash
                                    const colors = [
                                        "bg-blue-600 text-white",
                                        "bg-green-600 text-white", 
                                        "bg-purple-600 text-white",
                                        "bg-red-600 text-white",
                                        "bg-yellow-600 text-white",
                                        "bg-indigo-600 text-white",
                                        "bg-pink-600 text-white",
                                        "bg-teal-600 text-white"
                                    ];
                                    
                                    // Simple hash function for consistent colors
                                    let hash = 0;
                                    for (let i = 0; i < genre.length; i++) {
                                        hash = ((hash << 5) - hash) + genre.charCodeAt(i);
                                        hash = hash & hash; // Convert to 32-bit integer
                                    }
                                    const colorIndex = Math.abs(hash) % colors.length;
                                    
                                    return (
                                        <span
                                            key={genre}
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${colors[colorIndex]}`}
                                        >
                                            {genre}
                                        </span>
                                    );
                                    })}
                                </div>
                            )}

                            {/* Rating and ESRB */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="flex items-center gap-2">
                                    <Star className="text-yellow-400 fill-current" size={20} />
                                    <span className="text-white font-semibold">{displayData.rating}</span>
                                    <span className="text-gray-400">({displayData.reviewCount} reviews)</span>
                                </div>
                                <div className="text-gray-400">
                                    ESRB: <span className="text-white font-medium">{displayData.esrb}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-slate-700 mb-8">
                        <nav className="flex">
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                                    activeTab === 'details'
                                        ? 'text-cyan-400 border-cyan-400'
                                        : 'text-gray-400 border-transparent hover:text-gray-300'
                                }`}
                            >
                                Details
                            </button>
                            <button
                                onClick={() => setActiveTab('copies')}
                                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                                    activeTab === 'copies'
                                        ? 'text-cyan-400 border-cyan-400'
                                        : 'text-gray-400 border-transparent hover:text-gray-300'
                                }`}
                            >
                                Copies ({displayData.totalCopies})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'details' && (
                        <>
                            {/* Synopsis */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    {!game?.igdbGameId ? (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 text-lg mb-3">📚</div>
                                            <p className="text-gray-400 mb-2">No Synopsis Available</p>
                                            <p className="text-gray-500 text-sm mb-4">Link this game to IGDB to automatically populate synopsis and additional details.</p>
                                            <button
                                                onClick={handleLinkToIgdb}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors mx-auto"
                                            >
                                                <Link size={16} />
                                                Link to IGDB
                                            </button>
                                        </div>
                                    ) : igdbLoading ? (
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent"></div>
                                            Loading enhanced details...
                                        </div>
                                    ) : igdbError ? (
                                        <div className="text-amber-400 text-sm mb-2">
                                            ⚠️ Could not load enhanced details from IGDB
                                        </div>
                                    ) : (
                                        <p className="text-gray-300 leading-relaxed">{displayData.synopsis}</p>
                                    )}
                                </div>
                            </div>

                            {/* Game Information & Collection Stats */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                                {/* Game Information */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4">Game Information</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Developer:</span>
                                            <span className="text-white">{displayData.developer}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Publisher:</span>
                                            <span className="text-white">{displayData.publisher}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Release Date:</span>
                                            <span className="text-white">{displayData.releaseDate}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Platform:</span>
                                            <span className="text-white">{displayData.platform}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Collection Stats */}
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <h3 className="text-xl font-semibold text-white mb-4">Collection Stats</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Total Copies:</span>
                                            <span className="text-green-400 font-semibold">{displayData.totalCopies}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Estimated Value:</span>
                                            <span className="text-green-400 font-semibold">${displayData.estimatedValue.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Date Added:</span>
                                            <span className="text-white">{displayData.dateAdded}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Overall Condition:</span>
                                            <span className="text-white">{displayData.condition}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Screenshots */}
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-4">
                                    Screenshots
                                    {igdbLoading && game?.igdbGameId && (
                                        <span className="ml-2 text-sm text-gray-400 font-normal">
                                            (Loading enhanced screenshots...)
                                        </span>
                                    )}
                                </h2>
                                {!game?.igdbGameId ? (
                                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
                                        <div className="text-center">
                                            <div className="text-gray-400 text-4xl mb-4">🖼️</div>
                                            <p className="text-gray-400 mb-2">No Screenshots Available</p>
                                            <p className="text-gray-500 text-sm mb-4">Link this game to IGDB to automatically populate screenshots and media.</p>
                                            <button
                                                onClick={handleLinkToIgdb}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors mx-auto"
                                            >
                                                <Link size={16} />
                                                Link to IGDB
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {displayData.screenshots.map((screenshot) => (
                                            <div
                                                key={screenshot.id}
                                                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors cursor-pointer"
                                                title={screenshot.title}
                                            >
                                                {screenshot.url.startsWith('https:') ? (
                                                    <img 
                                                        src={screenshot.url} 
                                                        alt={screenshot.title}
                                                        className="w-full h-auto object-contain"
                                                        style={{
                                                            aspectRatio: screenshot.width && screenshot.height 
                                                                ? `${screenshot.width} / ${screenshot.height}` 
                                                                : 'auto'
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center text-4xl aspect-video">
                                                        {screenshot.url}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                </>
            )}

                    {activeTab === 'copies' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
                            <h3 className="text-xl font-semibold text-white mb-4">Your Copies</h3>
                            <div className="space-y-4">
                                {displayData.copies.length > 0 ? displayData.copies.map((copy) => (
                                    <div key={copy.id} className="bg-slate-700 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-white font-medium">{copy.description}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        mapApiConditionToGameCondition(copy.condition) === 'Complete' ? 'bg-green-600 text-white' :
                                                        mapApiConditionToGameCondition(copy.condition) === 'New' ? 'bg-blue-600 text-white' :
                                                        mapApiConditionToGameCondition(copy.condition) === 'Loose' ? 'bg-yellow-600 text-black' :
                                                        'bg-gray-600 text-white'
                                                    }`}>
                                                        {mapApiConditionToGameCondition(copy.condition)}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <p className="text-gray-400">Purchased:</p>
                                                        <p className="text-gray-300">
                                                            {new Date(copy.purchasedDate).toLocaleDateString('en-US', {
                                                                year: 'numeric', month: 'short', day: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-400">UPC:</p>
                                                        <p className="text-gray-300">{copy.upc || 'Unknown'}</p>
                                                    </div>
                                                    {copy.cost && (
                                                        <div>
                                                            <p className="text-gray-400">Purchase Price:</p>
                                                            <p className="text-gray-300">${copy.cost.toFixed(2)}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-green-400 font-semibold text-lg">${copy.estimatedValue?.toFixed(2) || '0.00'}</p>
                                                <p className="text-gray-400 text-sm">Current Value</p>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center text-gray-400 py-8">
                                        <p>No copies found in your collection.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-700">
                <button
                    onClick={() => {
                        if (consoleName) {
                            navigate(`/collection/console/${consoleName}`);
                        } else {
                            navigate('/collection');
                        }
                    }}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} />
                    {consoleName ? `Back to ${slugToDisplayName(consoleName)}` : 'Back to Collection'}
                </button>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleEditGame}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
                    >
                        <Edit size={16} />
                        Edit Game
                    </button>
                    <button
                        onClick={handleRemoveFromCollection}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
                    >
                        <Trash2 size={16} />
                        Remove from Collection
                    </button>
                    </div>
                    </div>

                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen} onClose={handleEditCancel} className="relative z-50">
                        <DialogBackdrop className="fixed inset-0 bg-black/50" />
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
                                <DialogTitle className="text-xl font-bold text-white mb-6">
                                    Edit Game Details
                                </DialogTitle>
                                
                                <div className="space-y-4">
                                    {/* Title Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Game Title
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={(e) => handleEditFormChange('title', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            placeholder="Enter game title"
                                        />
                                    </div>

                                    {/* Platform Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Platform
                                        </label>
                                        <PlatformCombobox
                                            value={selectedPlatform}
                                            onChange={setSelectedPlatform}
                                            placeholder="Select a platform..."
                                        />
                                    </div>

                                    {/* Publisher Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Publisher
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.publisher}
                                            onChange={(e) => handleEditFormChange('publisher', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                            placeholder="Enter publisher"
                                        />
                                    </div>
                                </div>

                                {/* Dialog Actions */}
                                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                                    <button
                                        onClick={handleEditCancel}
                                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>
                </>
            )}
        </div>
    );
};