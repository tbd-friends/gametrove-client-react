import React, {useState, useEffect} from "react";
import {ArrowLeft, Edit3, AlertCircle, Link, Plus, ChevronDown, X, Search, CheckCircle, Save} from "lucide-react";
import {useNavigate, useParams} from "react-router-dom";
import {Dialog, DialogBackdrop, DialogPanel, DialogTitle} from '@headlessui/react';
import {Breadcrumb, StarRating} from "../components/common";
import {PlatformCombobox} from "../components/forms";
import {PublisherCombobox} from "../components/forms/PublisherCombobox";
import {PriceChartingSearchDialog} from "../components/dialogs/PriceChartingSearchDialog";
import {PriceHistoryChart} from "../components/charts/PriceHistoryChart";
import {slugToDisplayName} from "../utils/slugUtils";
import {formatPercentageChange} from "../utils/priceUtils";
import {
    createGameApiService,
    createIgdbApiService,
    createConditionApiService,
    createPriceChartingApiService
} from "../../infrastructure/api";
import type {IgdbGameDetails, Condition, CreateCopyRequest, PriceChartingHistoryData, SaveReviewRequest, GameReview, SimilarGame} from "../../infrastructure/api";
import {useAuthService} from "../hooks/useAuthService";
import {usePriceCharting} from "../hooks";
import type {Game, Platform, Publisher} from "../../domain/models";
import {mapApiConditionToGameCondition} from "../../domain/models";

export const GameDetail: React.FC = () => {
    const navigate = useNavigate();
    const {gameId, consoleName} = useParams<{ gameId: string; consoleName?: string }>();
    const [activeTab, setActiveTab] = useState<'details' | 'copies' | 'pricecharting' | 'myreview' | 'morelikethis'>('details');
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
        title: ''
    });
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);
    const [selectedPublisher, setSelectedPublisher] = useState<Publisher | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);

    // Add copy dialog state
    const [isAddCopyDialogOpen, setIsAddCopyDialogOpen] = useState(false);
    const [addCopyForm, setAddCopyForm] = useState({
        datePurchased: '',
        purchaseCost: '',
        upcBarcode: ''
    });
    const [selectedConditions, setSelectedConditions] = useState<Condition[]>([]);
    const [addCopyLoading, setAddCopyLoading] = useState(false);
    const [addCopyError, setAddCopyError] = useState<string | null>(null);

    // Conditions data
    const [conditions, setConditions] = useState<Condition[]>([]);
    const [conditionsLoading, setConditionsLoading] = useState(false);
    const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);

    // PriceCharting search dialog state
    const [isPriceChartingSearchOpen, setIsPriceChartingSearchOpen] = useState(false);
    const [selectedCopyForPricing, setSelectedCopyForPricing] = useState<any>(null);

    // PriceCharting history state
    const [pricingHistoryData, setPricingHistoryData] = useState<PriceChartingHistoryData[]>([]);
    const [pricingHistoryLoading, setPricingHistoryLoading] = useState(false);
    const [pricingHistoryError, setPricingHistoryError] = useState<string | null>(null);

    // My Review state
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [graphicsRating, setGraphicsRating] = useState(0);
    const [soundRating, setSoundRating] = useState(0);
    const [gameplayRating, setGameplayRating] = useState(0);
    const [replayabilityRating, setReplayabilityRating] = useState(0);
    const [isGameCompleted, setIsGameCompleted] = useState(false);
    const [reviewSaveLoading, setReviewSaveLoading] = useState(false);
    const [reviewSaveError, setReviewSaveError] = useState<string | null>(null);
    const [reviewSaveSuccess, setReviewSaveSuccess] = useState(false);
    
    // Existing review state
    const [existingReview, setExistingReview] = useState<GameReview | null>(null);
    const [reviewLoadLoading, setReviewLoadLoading] = useState(false);
    const [reviewLoadError, setReviewLoadError] = useState<string | null>(null);

    // More Like This state
    const [moreLikeThisGames, setMoreLikeThisGames] = useState<SimilarGame[]>([]);
    const [moreLikeThisLoading, setMoreLikeThisLoading] = useState(false);
    const [moreLikeThisError, setMoreLikeThisError] = useState<string | null>(null);
    const [showMoreLikeThisTab, setShowMoreLikeThisTab] = useState(false);

    const authService = useAuthService();
    const {isEnabled: isPriceChartingEnabled} = usePriceCharting();

    // Function to load/refresh game data from API
    const loadGameData = async () => {
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
                    title: gameData.description
                });
                setSelectedPlatform(gameData.platform);
                setSelectedPublisher(gameData.publisher);
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
    };

    // Load game data from API
    useEffect(() => {
        loadGameData();
    }, [gameId, authService.isAuthenticated, authService]);

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
    }, [game?.igdbGameId, authService.isAuthenticated, authService]);

    // Load conditions when authenticated
    useEffect(() => {
        async function loadConditions() {
            if (!authService.isAuthenticated || authService.isLoading) {
                return;
            }

            try {
                setConditionsLoading(true);
                const conditionApiService = createConditionApiService(authService);
                const conditionsData = await conditionApiService.getAllConditions();
                setConditions(conditionsData);
                console.log('✅ Loaded conditions:', conditionsData);
            } catch (err) {
                console.error('❌ Failed to load conditions:', err);
                // Don't show error to user for conditions, just log it
            } finally {
                setConditionsLoading(false);
            }
        }

        loadConditions();
    }, [authService.isAuthenticated, authService]);

    // Load pricing history when PriceCharting is enabled and we have a gameId
    useEffect(() => {
        async function loadPricingHistory() {
            if (!gameId || !isPriceChartingEnabled || !authService.isAuthenticated || authService.isLoading || activeTab !== 'pricecharting') {
                return;
            }

            try {
                setPricingHistoryLoading(true);
                setPricingHistoryError(null);

                const priceChartingApiService = createPriceChartingApiService(authService);
                const historyData = await priceChartingApiService.getPriceHistory(gameId);

                setPricingHistoryData(historyData);
                console.log('✅ Loaded pricing history:', historyData);
            } catch (err) {
                console.error('❌ Failed to load pricing history:', err);
                setPricingHistoryError(err instanceof Error ? err.message : 'Failed to load pricing history');
            } finally {
                setPricingHistoryLoading(false);
            }
        }

        loadPricingHistory();
    }, [gameId, isPriceChartingEnabled, authService.isAuthenticated, authService, activeTab]);

    // Load existing review when My Review tab is accessed
    useEffect(() => {
        async function loadExistingReview() {
            if (!gameId || activeTab !== 'myreview' || !game?.hasReview || !authService.isAuthenticated || authService.isLoading) {
                return;
            }

            try {
                setReviewLoadLoading(true);
                setReviewLoadError(null);

                const gameApiService = createGameApiService(authService);
                const review = await gameApiService.getGameReview(gameId);

                if (review) {
                    setExistingReview(review);
                    console.log('✅ Loaded existing review:', review);
                } else {
                    setExistingReview(null);
                }
            } catch (err) {
                console.error('❌ Failed to load existing review:', err);
                setReviewLoadError(err instanceof Error ? err.message : 'Failed to load review');
            } finally {
                setReviewLoadLoading(false);
            }
        }

        loadExistingReview();
    }, [activeTab, gameId, game?.hasReview, authService.isAuthenticated, authService]);

    // Load more-like-this games when game is loaded
    useEffect(() => {
        async function loadMoreLikeThisGames() {
            if (!gameId || !authService.isAuthenticated || authService.isLoading) {
                return;
            }

            try {
                setMoreLikeThisLoading(true);
                setMoreLikeThisError(null);

                const gameApiService = createGameApiService(authService);
                const similarGames = await gameApiService.getMoreLikeThis(gameId);

                if (similarGames && similarGames.length > 0) {
                    setMoreLikeThisGames(similarGames);
                    setShowMoreLikeThisTab(true);
                    console.log('✅ Loaded similar games:', similarGames);
                } else {
                    setMoreLikeThisGames([]);
                    setShowMoreLikeThisTab(false);
                    console.log('ℹ️ No similar games found');
                }
            } catch (err) {
                console.error('❌ Failed to load similar games:', err);
                setMoreLikeThisError(err instanceof Error ? err.message : 'Failed to load similar games');
                setMoreLikeThisGames([]);
                setShowMoreLikeThisTab(false);
            } finally {
                setMoreLikeThisLoading(false);
            }
        }

        loadMoreLikeThisGames();
    }, [gameId, authService.isAuthenticated, authService]);

    // Close condition dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as HTMLElement;
            if (isConditionDropdownOpen && !target.closest('.condition-dropdown')) {
                setIsConditionDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isConditionDropdownOpen]);

    // Merge real game data with placeholder data where needed
    const displayData = React.useMemo(() => {
        if (!game) return null;

        // Calculate total estimated value from copies with pricing
        const totalEstimatedValue = game.copies
            ? game.copies.reduce((sum, copy) => sum + (copy.isPricingLinked ? (copy.estimatedValue || 0) : 0), 0)
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
            coverImage: igdbDetails?.cover ? `https:${igdbDetails.cover.medium}` : "🎮",
            screenshots: igdbDetails?.screenshots?.map((screenshot, index) => ({
                id: index + 1,
                thumbnail: `https:${screenshot.thumbnail}`,
                medium: `https:${screenshot.medium}`,
                title: `Screenshot ${index + 1}`,
                width: screenshot.width,
                height: screenshot.height
            })) || [
                {id: 1, thumbnail: "🌴", medium: "🌴", title: "Screenshot 1"},
                {id: 2, thumbnail: "❄️", medium: "❄️", title: "Screenshot 2"},
                {id: 3, thumbnail: "🏜️", medium: "🏜️", title: "Screenshot 3"},
                {id: 4, thumbnail: "🌊", medium: "🌊", title: "Screenshot 4"}
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
                {label: "My Collection", path: "/collection"},
                {label: slugToDisplayName(consoleName), path: `/collection/console/${consoleName}`},
                {label: gameTitle, path: ""}
            ]
            : [
                {label: "My Collection", path: "/collection"},
                {label: gameTitle, path: ""}
            ];
    }, [consoleName, displayData?.title]);

    const handleEditGame = () => {
        // Ensure form is populated with current game data when dialog opens
        if (game) {
            setEditForm({
                title: game.description
            });
            setSelectedPlatform(game.platform);
            setSelectedPublisher(game.publisher);
        }
        setIsEditDialogOpen(true);
    };

    const handleEditFormChange = (field: keyof typeof editForm, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleEditSubmit = async () => {
        if (!gameId || !selectedPlatform || !selectedPublisher) {
            setEditError('Missing required fields');
            return;
        }

        try {
            setEditLoading(true);
            setEditError(null);

            const gameApiService = createGameApiService(authService);
            await gameApiService.updateGame(gameId, {
                name: editForm.title.trim(),
                platformId: selectedPlatform.id,
                publisherId: selectedPublisher.id
            });

            console.log('✅ Game updated successfully');
            setIsEditDialogOpen(false);

            // Reload game data to reflect changes
            const updatedGame = await gameApiService.getGameById(gameId);
            if (updatedGame) {
                setGame(updatedGame);
                setEditForm({
                    title: updatedGame.description
                });
                setSelectedPlatform(updatedGame.platform);
                setSelectedPublisher(updatedGame.publisher);
            }
        } catch (error) {
            console.error('❌ Failed to update game:', error);
            setEditError(error instanceof Error ? error.message : 'Failed to update game');
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditCancel = () => {
        // Reset form to original values
        if (game) {
            setEditForm({
                title: game.description
            });
            setSelectedPlatform(game.platform);
            setSelectedPublisher(game.publisher);
        }
        setEditError(null);
        setIsEditDialogOpen(false);
    };

    const handleSearchPricing = (copy: any) => {
        setSelectedCopyForPricing(copy);
        setIsPriceChartingSearchOpen(true);
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

    const handleAddCopy = () => {
        // Reset form and open dialog
        setAddCopyForm({
            datePurchased: new Date().toISOString().split('T')[0], // Default to today
            purchaseCost: '',
            upcBarcode: ''
        });
        setSelectedConditions([]);
        setIsConditionDropdownOpen(false);
        setAddCopyError(null);
        setIsAddCopyDialogOpen(true);
    };

    const handleAddCopyFormChange = (field: keyof typeof addCopyForm, value: string) => {
        setAddCopyForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAddCopySubmit = async () => {
        if (!gameId) {
            setAddCopyError('Game ID is required');
            return;
        }

        try {
            setAddCopyLoading(true);
            setAddCopyError(null);

            // Calculate condition flags by summing selected condition values as bitwise flags
            const conditionFlags = selectedConditions
                .map(c => parseInt(c.value, 10))
                .reduce((sum, flag) => sum | flag, 0);

            // Prepare the copy request
            const copyRequest: CreateCopyRequest = {
                purchasedDate: addCopyForm.datePurchased,
                cost: addCopyForm.purchaseCost ? parseFloat(addCopyForm.purchaseCost) : null,
                upc: addCopyForm.upcBarcode || undefined,
                condition: conditionFlags,
                description: '' // Start with empty description
            };

            console.log('📦 Creating copy with request:', copyRequest);

            // Call the API to create the copy
            const gameApiService = createGameApiService(authService);
            await gameApiService.createGameCopy(gameId, copyRequest);

            console.log('✅ Copy created successfully');
            setIsAddCopyDialogOpen(false);

            // Reload game data to show the new copy
            const updatedGame = await gameApiService.getGameById(gameId);
            if (updatedGame) {
                setGame(updatedGame);
            }
        } catch (error) {
            console.error('❌ Failed to create copy:', error);
            setAddCopyError(error instanceof Error ? error.message : 'Failed to create copy');
        } finally {
            setAddCopyLoading(false);
        }
    };

    const handleAddCopyCancel = () => {
        setAddCopyForm({
            datePurchased: '',
            purchaseCost: '',
            upcBarcode: ''
        });
        setSelectedConditions([]);
        setIsConditionDropdownOpen(false);
        setAddCopyError(null);
        setIsAddCopyDialogOpen(false);
    };

    const handleSaveReview = async () => {
        if (!gameId) {
            setReviewSaveError('Game ID is required');
            return;
        }

        try {
            setReviewSaveLoading(true);
            setReviewSaveError(null);
            setReviewSaveSuccess(false);

            const reviewRequest: SaveReviewRequest = {
                title: reviewTitle.trim(),
                content: reviewText.trim(),
                graphicsRating,
                soundRating,
                gameplayRating,
                replayabilityRating,
                isCompleted: isGameCompleted,
                overallRating: Math.round((graphicsRating + soundRating + gameplayRating + replayabilityRating) / 4 * 20)
            };

            const gameApiService = createGameApiService(authService);
            await gameApiService.saveGameReview(gameId, reviewRequest);
            
            setReviewSaveSuccess(true);
            console.log('✅ Review saved successfully');

            // Clear the form state since we'll be showing the read-only review
            setReviewTitle('');
            setReviewText('');
            setGraphicsRating(0);
            setSoundRating(0);
            setGameplayRating(0);
            setReplayabilityRating(0);
            setIsGameCompleted(false);

            // Reload game data to get updated hasReview flag
            setTimeout(async () => {
                try {
                    const updatedGame = await gameApiService.getGameById(gameId);
                    if (updatedGame) {
                        setGame(updatedGame);
                    }
                } catch (error) {
                    console.error('Failed to reload game data:', error);
                }
            }, 500);

            // Auto-hide success message after 3 seconds
            setTimeout(() => {
                setReviewSaveSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('❌ Failed to save review:', error);
            setReviewSaveError(error instanceof Error ? error.message : 'Failed to save review');
        } finally {
            setReviewSaveLoading(false);
        }
    };

    return (
        <div className="w-full relative">
            {/* IGDB Linked Button - Top Right */}
            {game?.igdbGameId && (
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={handleLinkToIgdb}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-600 hover:border-slate-500 transition-colors text-sm"
                        title="Relink to IGDB"
                    >
                        <Link size={14}/>
                        <span className="hidden sm:inline">IGDB Linked</span>
                    </button>
                </div>
            )}

            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems}/>

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
                    <AlertCircle className="text-red-400 flex-shrink-0" size={20}/>
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
                        <div
                            className="w-48 h-64 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                            {igdbDetails?.cover ? (
                                <img
                                    src={displayData.coverImage}
                                    alt={`${displayData.title} cover`}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-6xl">{displayData.coverImage}</span>
                            )}
                            {/* Age Rating Badge */}
                            {(() => {
                                const pegiRating = igdbDetails?.ageRatings?.find(rating => rating.startsWith('PEGI'));
                                const esrbRating = igdbDetails?.ageRatings?.find(rating => rating.startsWith('ESRB'));
                                const displayRating = esrbRating || pegiRating;
                                
                                return displayRating ? (
                                    <div className="absolute top-2 left-2 bg-slate-900 border border-slate-600 rounded px-2 py-1">
                                        <span className="text-white text-xs font-bold">{displayRating}</span>
                                    </div>
                                ) : null;
                            })()}
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
                                        <Edit3 size={20}/>
                                    </button>
                                </div>
                                {!game?.igdbGameId && (
                                    <button
                                        onClick={handleLinkToIgdb}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
                                    >
                                        <Link size={16}/>
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
                                    {displayData.genres.map((genre) => {
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

                            {/* Review Score or Age Rating */}
                            <div className="mb-6">
                                {game?.review?.overallRating ? (
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 text-sm">My Rating:</span>
                                                <span className={`text-2xl font-bold ${
                                                    game.review.overallRating < 35 ? 'text-red-400' :
                                                    game.review.overallRating < 55 ? 'text-yellow-400' :
                                                    game.review.overallRating < 75 ? 'text-blue-400' :
                                                    'text-green-400'
                                                }`}>
                                                    {game.review.overallRating}
                                                </span>
                                                <span className="text-gray-500 text-sm">/ 100</span>
                                            </div>
                                            {(() => {
                                                const pegiRating = igdbDetails?.ageRatings?.find(rating => rating.startsWith('PEGI'));
                                                const esrbRating = igdbDetails?.ageRatings?.find(rating => rating.startsWith('ESRB'));
                                                
                                                const ratings = [];
                                                if (pegiRating) ratings.push(pegiRating);
                                                if (esrbRating) ratings.push(esrbRating);
                                                
                                                return ratings.length > 0 ? (
                                                    <div className="text-gray-400">
                                                        {ratings.map((rating, index) => (
                                                            <span key={rating}>
                                                                <span className="text-white font-medium">{rating}</span>
                                                                {index < ratings.length - 1 && ' • '}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : null;
                                            })()}
                                        </div>
                                        {game.review.title && (
                                            <div className="ml-16">
                                                <span className="text-cyan-200 italic font-medium text-lg">
                                                    "{game.review.title}"
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-gray-400">
                                        {(() => {
                                            const pegiRating = igdbDetails?.ageRatings?.find(rating => rating.startsWith('PEGI'));
                                            const esrbRating = igdbDetails?.ageRatings?.find(rating => rating.startsWith('ESRB'));
                                            
                                            const ratings = [];
                                            if (pegiRating) ratings.push(pegiRating);
                                            if (esrbRating) ratings.push(esrbRating);
                                            
                                            return ratings.length > 0 ? (
                                                <>
                                                    {ratings.map((rating, index) => (
                                                        <span key={rating}>
                                                            <span className="text-white font-medium">{rating}</span>
                                                            {index < ratings.length - 1 && ' • '}
                                                        </span>
                                                    ))}
                                                </>
                                            ) : (
                                                <>ESRB: <span className="text-white font-medium">{displayData.esrb}</span></>
                                            );
                                        })()}
                                    </div>
                                )}
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
                            {isPriceChartingEnabled && (
                                <button
                                    onClick={() => setActiveTab('pricecharting')}
                                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                                        activeTab === 'pricecharting'
                                            ? 'text-cyan-400 border-cyan-400'
                                            : 'text-gray-400 border-transparent hover:text-gray-300'
                                    }`}
                                >
                                    PriceCharting
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('myreview')}
                                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                                    activeTab === 'myreview'
                                        ? 'text-cyan-400 border-cyan-400'
                                        : 'text-gray-400 border-transparent hover:text-gray-300'
                                }`}
                            >
                                My Review
                            </button>
                            {showMoreLikeThisTab && (
                                <button
                                    onClick={() => setActiveTab('morelikethis')}
                                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                                        activeTab === 'morelikethis'
                                            ? 'text-cyan-400 border-cyan-400'
                                            : 'text-gray-400 border-transparent hover:text-gray-300'
                                    }`}
                                >
                                    More Like This ({moreLikeThisGames.length})
                                </button>
                            )}
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
                                            <p className="text-gray-500 text-sm mb-4">Link this game to IGDB to
                                                automatically populate synopsis and additional details.</p>
                                            <button
                                                onClick={handleLinkToIgdb}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors mx-auto"
                                            >
                                                <Link size={16}/>
                                                Link to IGDB
                                            </button>
                                        </div>
                                    ) : igdbLoading ? (
                                        <div className="flex items-center gap-3 text-gray-400">
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent"></div>
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
                                            <span
                                                className="text-green-400 font-semibold">{displayData.totalCopies}</span>
                                        </div>
                                        {displayData.estimatedValue > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Estimated Value:</span>
                                                <span
                                                    className="text-green-400 font-semibold">${displayData.estimatedValue.toFixed(2)}</span>
                                            </div>
                                        )}
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
                                            <p className="text-gray-500 text-sm mb-4">Link this game to IGDB to
                                                automatically populate screenshots and media.</p>
                                            <button
                                                onClick={handleLinkToIgdb}
                                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors mx-auto"
                                            >
                                                <Link size={16}/>
                                                Link to IGDB
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {displayData.screenshots.map((screenshot) => (
                                            <div
                                                key={screenshot.id}
                                                className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors cursor-pointer"
                                                title={screenshot.title}
                                            >
                                                {screenshot.medium.startsWith('https:') ? (
                                                    <img
                                                        src={screenshot.medium}
                                                        alt={screenshot.title}
                                                        className="w-full h-auto object-contain"
                                                        style={{
                                                            aspectRatio: screenshot.width && screenshot.height
                                                                ? `${screenshot.width} / ${screenshot.height}`
                                                                : 'auto'
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="flex items-center justify-center text-4xl aspect-video">
                                                        {screenshot.medium}
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
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-white">Your Copies</h3>
                                <button
                                    onClick={handleAddCopy}
                                    className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
                                >
                                    <Plus size={16}/>
                                    Add Copy
                                </button>
                            </div>
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
                                            {copy.isPricingLinked ? (
                                                <div className="text-right">
                                                    <p className="text-green-400 font-semibold text-lg">${copy.estimatedValue?.toFixed(2) || '0.00'}</p>
                                                    <p className="text-gray-400 text-sm">
                                                        {isPriceChartingEnabled ? 'Current Value' : 'Last Known Value'}
                                                    </p>
                                                </div>
                                            ) : isPriceChartingEnabled ? (
                                                <div className="text-right">
                                                    <button
                                                        onClick={() => handleSearchPricing(copy)}
                                                        className="flex items-center gap-2 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition-colors"
                                                        title="Search for pricing data"
                                                    >
                                                        <Search className="w-4 h-4"/>
                                                        Search Pricing
                                                    </button>
                                                </div>
                                            ) : null}
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

                    {activeTab === 'pricecharting' && isPriceChartingEnabled && (
                        <div className="space-y-6 mb-8">
                            {/* Loading State */}
                            {pricingHistoryLoading && (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <div className="flex items-center justify-center py-12">
                                        <div
                                            className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                                        <span className="ml-3 text-gray-400">Loading pricing history...</span>
                                    </div>
                                </div>
                            )}

                            {/* Error State */}
                            {pricingHistoryError && !pricingHistoryLoading && (
                                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="text-red-400 flex-shrink-0" size={20}/>
                                        <div>
                                            <h3 className="text-red-400 font-medium">Failed to load pricing data</h3>
                                            <p className="text-gray-300 text-sm mt-1">{pricingHistoryError}</p>
                                            <button
                                                onClick={() => {
                                                    if (gameId && isPriceChartingEnabled && authService.isAuthenticated) {
                                                        const loadPricingHistory = async () => {
                                                            try {
                                                                setPricingHistoryLoading(true);
                                                                setPricingHistoryError(null);
                                                                const priceChartingApiService = createPriceChartingApiService(authService);
                                                                const historyData = await priceChartingApiService.getPriceHistory(gameId);
                                                                setPricingHistoryData(historyData);
                                                            } catch (err) {
                                                                setPricingHistoryError(err instanceof Error ? err.message : 'Failed to load pricing history');
                                                            } finally {
                                                                setPricingHistoryLoading(false);
                                                            }
                                                        };
                                                        loadPricingHistory();
                                                    }
                                                }}
                                                className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                                            >
                                                Retry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success State - Chart and Data */}
                            {!pricingHistoryLoading && !pricingHistoryError && pricingHistoryData.length > 0 && pricingHistoryData.some(edition => edition.history && edition.history.length > 0) && (
                                <>
                                    {/* Current Market Price Section */}
                                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-white">Latest</h3>
                                                </div>
                                            </div>
                                            {pricingHistoryData.length > 0 && (
                                                <div className="text-right">
                                                    <p className="text-gray-400 text-xs">Last updated</p>
                                                    <p className="text-gray-300 text-sm">
                                                        {new Date(pricingHistoryData[0].lastUpdated).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Current Price Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {pricingHistoryData
                                                .map(edition => {
                                                    const newStats = formatPercentageChange(edition.statistics.newPercentageChange);
                                                    const newStats12M = formatPercentageChange(edition.statistics.newPercentageChange12Months);
                                                    const completeStats = formatPercentageChange(edition.statistics.completeInBoxPercentageChange);
                                                    const completeStats12M = formatPercentageChange(edition.statistics.completeInBoxPercentageChange12Months);
                                                    const looseStats = formatPercentageChange(edition.statistics.loosePercentageChange);
                                                    const looseStats12M = formatPercentageChange(edition.statistics.loosePercentageChange12Months);

                                                    return (
                                                        <div key={edition.priceChartingId}>
                                                            <h4 className="text-white font-semibold mb-3 text-center">{edition.name}</h4>
                                                            <div className="space-y-3">
                                                                {/* New */}
                                                                <div className="bg-slate-700 rounded-lg p-4">
                                                                    <div
                                                                        className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className="w-3 h-3 bg-green-400 rounded-full"></span>
                                                                            <span
                                                                                className="text-gray-300 font-medium">New</span>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="text-2xl font-bold text-green-400 mb-2">${edition.new.toFixed(2)}</div>
                                                                    <div className="space-y-1 text-xs">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-400">Recent:</span>
                                                                            <span className={newStats.colorClass}>{newStats.displayText}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-400">12 months:</span>
                                                                            <span className={newStats12M.colorClass}>{newStats12M.displayText}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Complete */}
                                                                <div className="bg-slate-700 rounded-lg p-4">
                                                                    <div
                                                                        className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className="w-3 h-3 bg-cyan-400 rounded-full"></span>
                                                                            <span
                                                                                className="text-gray-300 font-medium">Complete</span>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="text-2xl font-bold text-cyan-400 mb-2">${edition.completeInBox.toFixed(2)}</div>
                                                                    <div className="space-y-1 text-xs">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-400">Recent:</span>
                                                                            <span className={completeStats.colorClass}>{completeStats.displayText}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-400">12 months:</span>
                                                                            <span className={completeStats12M.colorClass}>{completeStats12M.displayText}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Loose */}
                                                                <div className="bg-slate-700 rounded-lg p-4">
                                                                    <div
                                                                        className="flex items-center justify-between mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                                                                            <span
                                                                                className="text-gray-300 font-medium">Loose</span>
                                                                        </div>
                                                                    </div>
                                                                    <div
                                                                        className="text-2xl font-bold text-yellow-400 mb-2">${edition.loose.toFixed(2)}</div>
                                                                    <div className="space-y-1 text-xs">
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-400">Recent:</span>
                                                                            <span className={looseStats.colorClass}>{looseStats.displayText}</span>
                                                                        </div>
                                                                        <div className="flex justify-between">
                                                                            <span className="text-gray-400">12 months:</span>
                                                                            <span className={looseStats12M.colorClass}>{looseStats12M.displayText}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>

                                    {/* Price History Chart */}
                                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                        <div className="mb-6">
                                            <h3 className="text-xl font-semibold text-white mb-2">Price History</h3>
                                        </div>
                                        <PriceHistoryChart data={pricingHistoryData}/>
                                    </div>
                                </>
                            )}

                            {/* No Data State */}
                            {!pricingHistoryLoading && !pricingHistoryError && (pricingHistoryData.length === 0 || !pricingHistoryData.some(edition => edition.history && edition.history.length > 0)) && (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                                    <div className="text-center text-gray-400 py-12">
                                        <div className="text-6xl mb-4">📊</div>
                                        <p className="text-lg mb-2">No Pricing History Available</p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            This game doesn't have any pricing history data available from
                                            PriceCharting.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'myreview' && (
                        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
                            {/* Loading State */}
                            {reviewLoadLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                                    <span className="ml-3 text-gray-400">Loading review...</span>
                                </div>
                            )}

                            {/* Error State */}
                            {reviewLoadError && !reviewLoadLoading && (
                                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
                                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                                    <div>
                                        <h3 className="text-red-400 font-medium">Failed to load review</h3>
                                        <p className="text-gray-300 text-sm mt-1">{reviewLoadError}</p>
                                    </div>
                                </div>
                            )}

                            {/* Existing Review Display (Read-Only) */}
                            {!reviewLoadLoading && !reviewLoadError && existingReview && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-white">Your Review</h3>
                                        
                                        {/* Completion Status */}
                                        {existingReview.isCompleted && (
                                            <div className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg">
                                                <CheckCircle size={16} className="fill-current" />
                                                <span className="text-sm font-medium">Completed</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Review Title */}
                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold text-white mb-2">{existingReview.title}</h4>
                                    </div>

                                    {/* Review Content */}
                                    <div className="mb-8">
                                        <div className="bg-slate-700 rounded-lg p-4">
                                            <p className="text-gray-300 whitespace-pre-wrap">{existingReview.content}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        {/* Rating Categories (Read-Only) */}
                                        <div className="space-y-6">
                                            {/* Graphics Rating */}
                                            <div>
                                                <label className="block text-white font-medium mb-3">Graphics</label>
                                                <StarRating 
                                                    rating={existingReview.graphicsRating}
                                                    onRatingChange={() => {}} // No-op for read-only
                                                    size={24}
                                                    readonly={true}
                                                />
                                            </div>

                                            {/* Sound Rating */}
                                            <div>
                                                <label className="block text-white font-medium mb-3">Sound</label>
                                                <StarRating 
                                                    rating={existingReview.soundRating}
                                                    onRatingChange={() => {}} // No-op for read-only
                                                    size={24}
                                                    readonly={true}
                                                />
                                            </div>

                                            {/* Gameplay Rating */}
                                            <div>
                                                <label className="block text-white font-medium mb-3">Gameplay</label>
                                                <StarRating 
                                                    rating={existingReview.gameplayRating}
                                                    onRatingChange={() => {}} // No-op for read-only
                                                    size={24}
                                                    readonly={true}
                                                />
                                            </div>

                                            {/* Replayability Rating */}
                                            <div>
                                                <label className="block text-white font-medium mb-3">Replayability</label>
                                                <StarRating 
                                                    rating={existingReview.replayabilityRating}
                                                    onRatingChange={() => {}} // No-op for read-only
                                                    size={24}
                                                    readonly={true}
                                                />
                                            </div>
                                        </div>

                                        {/* Overall Score Display */}
                                        <div className="flex items-center justify-center">
                                            <div className="text-center">
                                                <h4 className="text-white font-semibold mb-4">Overall Score</h4>
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                                        {/* Background circle */}
                                                        <circle
                                                            cx="60"
                                                            cy="60"
                                                            r="50"
                                                            fill="transparent"
                                                            stroke="rgb(71 85 105)" // slate-600
                                                            strokeWidth="8"
                                                        />
                                                        {/* Progress circle */}
                                                        <circle
                                                            cx="60"
                                                            cy="60"
                                                            r="50"
                                                            fill="transparent"
                                                            stroke="rgb(34 211 238)" // cyan-400
                                                            strokeWidth="8"
                                                            strokeLinecap="round"
                                                            strokeDasharray={`${existingReview.overallRating * 314 / 100} 314`}
                                                            className="transition-all duration-500"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-3xl font-bold text-white">
                                                            {existingReview.overallRating}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-400 text-sm mt-2">out of 100</p>
                                                {existingReview.updatedDate && (
                                                    <p className="text-gray-500 text-xs mt-2">
                                                        Last updated: {new Date(existingReview.updatedDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Create New Review Form */}
                            {!reviewLoadLoading && !reviewLoadError && !existingReview && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-white">Your Review</h3>
                                        
                                        {/* Game Completed Toggle */}
                                        <div className="flex items-center gap-3">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsGameCompleted(!isGameCompleted)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                                        isGameCompleted
                                                            ? 'bg-green-600 text-white'
                                                            : 'bg-slate-700 text-gray-400 hover:bg-slate-600 hover:text-white'
                                                    }`}
                                                >
                                                    <CheckCircle size={16} className={isGameCompleted ? 'fill-current' : ''} />
                                                    <span className="text-sm font-medium">
                                                        {isGameCompleted ? 'Completed' : 'Mark as Completed'}
                                                    </span>
                                                </button>
                                            </label>
                                        </div>
                                    </div>
                            
                            {/* Review Title */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Review Title
                                </label>
                                <input
                                    type="text"
                                    value={reviewTitle}
                                    onChange={(e) => setReviewTitle(e.target.value)}
                                    placeholder="A quick tagline for your review (e.g., 'Epic adventure, but too short')"
                                    maxLength={100}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                />
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-gray-500 text-xs">This will appear as a quick summary under the game details</p>
                                    <span className="text-gray-400 text-xs">{reviewTitle.length}/100</span>
                                </div>
                            </div>

                            {/* Review Text Area */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Write your review
                                </label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Share your thoughts on the game..."
                                    rows={6}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Rating Categories */}
                                <div className="space-y-6">
                                    {/* Graphics Rating */}
                                    <div>
                                        <label className="block text-white font-medium mb-3">Graphics</label>
                                        <StarRating 
                                            rating={graphicsRating}
                                            onRatingChange={setGraphicsRating}
                                            size={24}
                                        />
                                    </div>

                                    {/* Sound Rating */}
                                    <div>
                                        <label className="block text-white font-medium mb-3">Sound</label>
                                        <StarRating 
                                            rating={soundRating}
                                            onRatingChange={setSoundRating}
                                            size={24}
                                        />
                                    </div>

                                    {/* Gameplay Rating */}
                                    <div>
                                        <label className="block text-white font-medium mb-3">Gameplay</label>
                                        <StarRating 
                                            rating={gameplayRating}
                                            onRatingChange={setGameplayRating}
                                            size={24}
                                        />
                                    </div>

                                    {/* Replayability Rating */}
                                    <div>
                                        <label className="block text-white font-medium mb-3">Replayability</label>
                                        <StarRating 
                                            rating={replayabilityRating}
                                            onRatingChange={setReplayabilityRating}
                                            size={24}
                                        />
                                    </div>
                                </div>

                                {/* Overall Score Display */}
                                <div className="flex items-center justify-center">
                                    <div className="text-center">
                                        <h4 className="text-white font-semibold mb-4">Overall Score</h4>
                                        <div className="relative w-32 h-32 mx-auto">
                                            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                                                {/* Background circle */}
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    fill="transparent"
                                                    stroke="rgb(71 85 105)" // slate-600
                                                    strokeWidth="8"
                                                />
                                                {/* Progress circle */}
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    fill="transparent"
                                                    stroke="rgb(34 211 238)" // cyan-400
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${(graphicsRating + soundRating + gameplayRating + replayabilityRating) / 4 * 20 * 314 / 100} 314`}
                                                    className="transition-all duration-500"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-3xl font-bold text-white">
                                                    {Math.round((graphicsRating + soundRating + gameplayRating + replayabilityRating) / 4 * 20)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm mt-2">out of 100</p>
                                    </div>
                                </div>
                            </div>

                            {/* Save Section */}
                            <div className="mt-8 pt-6 border-t border-slate-700">
                                {/* Success/Error Messages */}
                                {(reviewSaveError || reviewSaveSuccess) && (
                                    <div className={`mb-4 p-4 rounded-lg ${
                                        reviewSaveError
                                            ? 'bg-red-900/20 border border-red-500'
                                            : 'bg-green-900/20 border border-green-500'
                                    }`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-${reviewSaveError ? 'red' : 'green'}-400`}>
                                                {reviewSaveError ? '❌' : '✅'}
                                            </span>
                                            <div>
                                                <p className={`text-${reviewSaveError ? 'red' : 'green'}-400 font-medium`}>
                                                    {reviewSaveError ? 'Failed to save review' : 'Review saved successfully!'}
                                                </p>
                                                {reviewSaveError && (
                                                    <p className="text-red-300 text-sm mt-1">{reviewSaveError}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSaveReview}
                                        disabled={
                                            reviewSaveLoading ||
                                            !reviewTitle.trim() ||
                                            !reviewText.trim() ||
                                            graphicsRating === 0 ||
                                            soundRating === 0 ||
                                            gameplayRating === 0 ||
                                            replayabilityRating === 0
                                        }
                                        className="flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600"
                                    >
                                        {reviewSaveLoading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                <span>Saving...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save size={16} />
                                                <span>Save Review</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'morelikethis' && showMoreLikeThisTab && (
                        <div className="mb-8">
                            {/* Loading State */}
                            {moreLikeThisLoading && (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                                    <span className="ml-3 text-gray-400">Loading similar games...</span>
                                </div>
                            )}

                            {/* Error State */}
                            {moreLikeThisError && !moreLikeThisLoading && (
                                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
                                    <AlertCircle className="text-red-400 flex-shrink-0" size={20}/>
                                    <div>
                                        <h3 className="text-red-400 font-medium">Failed to load similar games</h3>
                                        <p className="text-gray-300 text-sm mt-1">{moreLikeThisError}</p>
                                    </div>
                                </div>
                            )}

                            {/* Games Grid */}
                            {!moreLikeThisLoading && !moreLikeThisError && moreLikeThisGames.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-6">Games Similar to {displayData?.title}</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {moreLikeThisGames.map((similarGame) => (
                                            <div
                                                key={similarGame.identifier}
                                                className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700 transition-colors cursor-pointer group"
                                                onClick={() => navigate(`/collection/game/${similarGame.identifier}`)}
                                            >
                                                <div className="text-center">
                                                    {/* Game Icon/Cover */}
                                                    <div className="w-16 h-20 bg-slate-600 border border-slate-500 rounded flex items-center justify-center text-3xl mx-auto mb-3">
                                                        🎮
                                                    </div>
                                                    
                                                    {/* Game Info */}
                                                    <div>
                                                        <h4 className="text-white font-semibold text-sm group-hover:text-cyan-400 transition-colors mb-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                            {similarGame.name}
                                                        </h4>
                                                        <p className="text-gray-400 text-xs">
                                                            {similarGame.platform}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Games State */}
                            {!moreLikeThisLoading && !moreLikeThisError && moreLikeThisGames.length === 0 && (
                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
                                    <div className="text-center">
                                        <div className="text-gray-400 text-4xl mb-4">🎲</div>
                                        <p className="text-gray-400 mb-2">No Similar Games Found</p>
                                        <p className="text-gray-500 text-sm">
                                            We couldn't find any games similar to this one in our database.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex items-center justify-start pt-6 border-t border-slate-700">
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
                            <ArrowLeft size={16}/>
                            {consoleName ? `Back to ${slugToDisplayName(consoleName)}` : 'Back to Collection'}
                        </button>
                    </div>

                    {/* Edit Dialog */}
                    <Dialog open={isEditDialogOpen} onClose={handleEditCancel} className="relative z-50">
                        <DialogBackdrop className="fixed inset-0 bg-black/50"/>
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel
                                className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-md">
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
                                            disabled={editLoading}
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            disabled={editLoading}
                                        />
                                    </div>

                                    {/* Publisher Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Publisher
                                        </label>
                                        <PublisherCombobox
                                            value={selectedPublisher}
                                            onChange={setSelectedPublisher}
                                            placeholder="Select a publisher..."
                                            disabled={editLoading}
                                        />
                                    </div>
                                </div>

                                {/* Error Display */}
                                {editError && (
                                    <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="text-red-400 flex-shrink-0" size={16}/>
                                            <p className="text-red-400 text-sm">{editError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Dialog Actions */}
                                <div
                                    className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-700">
                                    <button
                                        onClick={handleEditCancel}
                                        disabled={editLoading}
                                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleEditSubmit}
                                        disabled={editLoading || !editForm.title.trim() || !selectedPlatform || !selectedPublisher}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600"
                                    >
                                        {editLoading && (
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        )}
                                        Save Changes
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>

                    {/* Add Copy Dialog */}
                    <Dialog open={isAddCopyDialogOpen} onClose={handleAddCopyCancel} className="relative z-50">
                        <DialogBackdrop className="fixed inset-0 bg-black/50"/>
                        <div className="fixed inset-0 flex items-center justify-center p-4">
                            <DialogPanel
                                className="bg-slate-800 border border-slate-700 rounded-lg p-6 w-full max-w-2xl">
                                <DialogTitle className="text-xl font-bold text-white mb-6">
                                    Add New Copy
                                </DialogTitle>

                                {/* Game Info Header */}
                                <div className="flex items-center gap-4 mb-6 p-4 bg-slate-700 rounded-lg">
                                    <div
                                        className="w-12 h-16 bg-slate-600 border border-slate-500 rounded flex items-center justify-center text-2xl flex-shrink-0">
                                        🎮
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">{displayData?.title}</h3>
                                        <p className="text-gray-400 text-sm">
                                            {displayData?.platform} • {displayData?.publisher} • {displayData?.year}
                                        </p>
                                    </div>
                                </div>

                                {/* Copy Information Section */}
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white mb-4">Copy Information</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date Purchased */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Date Purchased
                                            </label>
                                            <input
                                                type="date"
                                                value={addCopyForm.datePurchased}
                                                onChange={(e) => handleAddCopyFormChange('datePurchased', e.target.value)}
                                                disabled={addCopyLoading}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Purchase Cost */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                Purchase Cost
                                            </label>
                                            <div className="relative">
                                                <span
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={addCopyForm.purchaseCost}
                                                    onChange={(e) => handleAddCopyFormChange('purchaseCost', e.target.value)}
                                                    disabled={addCopyLoading}
                                                    placeholder="0.00"
                                                    className="w-full pl-7 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* UPC/Barcode */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            UPC/Barcode
                                        </label>
                                        <input
                                            type="text"
                                            value={addCopyForm.upcBarcode}
                                            onChange={(e) => handleAddCopyFormChange('upcBarcode', e.target.value)}
                                            disabled={addCopyLoading}
                                            placeholder="Enter UPC code (e.g., 045496590420)"
                                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        <p className="text-gray-400 text-sm mt-1">
                                            This helps identify the specific version/edition of the game
                                        </p>
                                    </div>

                                    {/* Condition Selection */}
                                    <div className="mt-4 relative condition-dropdown">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Condition
                                        </label>

                                        {/* Selected Conditions Display */}
                                        {selectedConditions.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {selectedConditions.map((condition) => (
                                                    <span
                                                        key={condition.value}
                                                        className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-600 text-white text-xs rounded-full"
                                                    >
                                                        {condition.label}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedConditions(prev => prev.filter(c => c.value !== condition.value));
                                                            }}
                                                            disabled={addCopyLoading}
                                                            className="ml-1 hover:bg-cyan-700 rounded-full p-0.5 disabled:opacity-50"
                                                        >
                                                            <X size={10}/>
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Dropdown Button */}
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsConditionDropdownOpen(!isConditionDropdownOpen)}
                                                disabled={addCopyLoading || conditionsLoading}
                                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
                                            >
                                                <span className="text-gray-400">
                                                    {conditionsLoading ? (
                                                        <span className="flex items-center gap-2">
                                                            <div
                                                                className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent"></div>
                                                            Loading conditions...
                                                        </span>
                                                    ) : selectedConditions.length === 0 ? (
                                                        'Select conditions...'
                                                    ) : (
                                                        `${selectedConditions.length} condition${selectedConditions.length === 1 ? '' : 's'} selected`
                                                    )}
                                                </span>
                                                <ChevronDown
                                                    size={16}
                                                    className={`text-gray-400 transition-transform ${isConditionDropdownOpen ? 'transform rotate-180' : ''}`}
                                                />
                                            </button>

                                            {/* Dropdown Content */}
                                            {isConditionDropdownOpen && !conditionsLoading && (
                                                <div
                                                    className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                                    {conditions.length === 0 ? (
                                                        <div className="p-3 text-gray-400 text-sm">No conditions
                                                            available</div>
                                                    ) : (
                                                        conditions.map((condition) => {
                                                            const isSelected = selectedConditions.some(c => c.value === condition.value);
                                                            return (
                                                                <label
                                                                    key={condition.value}
                                                                    className="flex items-center gap-2 p-3 hover:bg-slate-600 cursor-pointer"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={isSelected}
                                                                        onChange={(e) => {
                                                                            if (e.target.checked) {
                                                                                setSelectedConditions(prev => [...prev, condition]);
                                                                            } else {
                                                                                setSelectedConditions(prev => prev.filter(c => c.value !== condition.value));
                                                                            }
                                                                        }}
                                                                        disabled={addCopyLoading}
                                                                        className="w-4 h-4 text-cyan-600 bg-slate-600 border-slate-500 rounded focus:ring-cyan-500 focus:ring-2 disabled:opacity-50"
                                                                    />
                                                                    <span
                                                                        className="text-gray-300 text-sm">{condition.label}</span>
                                                                </label>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-gray-400 text-sm mt-1">
                                            Select the condition(s) that apply to this copy
                                        </p>
                                    </div>
                                </div>

                                {/* Error Display */}
                                {addCopyError && (
                                    <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="text-red-400 flex-shrink-0" size={16}/>
                                            <p className="text-red-400 text-sm">{addCopyError}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Dialog Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                                    <button
                                        onClick={handleAddCopyCancel}
                                        disabled={addCopyLoading}
                                        className="px-4 py-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAddCopySubmit}
                                        disabled={addCopyLoading || !addCopyForm.datePurchased || selectedConditions.length === 0}
                                        className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-cyan-600"
                                    >
                                        {addCopyLoading && (
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        )}
                                        Add Copy
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </Dialog>

                    {/* PriceCharting Search Dialog */}
                    <PriceChartingSearchDialog
                        isOpen={isPriceChartingSearchOpen}
                        onClose={() => setIsPriceChartingSearchOpen(false)}
                        copy={selectedCopyForPricing}
                        gameName={displayData?.title || game?.description || ''}
                        onSuccess={loadGameData}
                    />
                </>
            )}
        </div>
    );
};