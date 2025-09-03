import React, { useState, useEffect } from "react";
import { AlertCircle, Search, List, Grid3X3, Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/common";
import { consoleNameToSlug } from "../utils/slugUtils";
import { usePagination, useGamesData, useBarcodeScanner, usePriceCharting, useDebounce } from "../hooks";
import { createPriceChartingApiService } from "../../infrastructure/api";
import { useAuthService } from "../hooks/useAuthService";
import {
  GamesTable,
  ConsolesGrid,
  PaginationControls
} from "../components/collection";

interface Console {
  name: string;
  company: string;
  gameCount: number;
  color: string;
  icon: string;
}

const COLLECTION_VIEW_KEY = 'gametrove_collection_view_mode';
const COLLECTION_SEARCH_KEY = 'gametrove_collection_search';

export const MyCollection: React.FC = () => {
    // Initialize search value from localStorage
    const [searchValue, setSearchValue] = useState(() => {
        return localStorage.getItem(COLLECTION_SEARCH_KEY) || '';
    });
    // Debounce the search value to prevent API calls on every keystroke
    const debouncedSearchValue = useDebounce(searchValue, 300);
    const [isScanning, setIsScanning] = useState(false);
    const [isProgrammaticUpdate, setIsProgrammaticUpdate] = useState(false);
    const [isSearchFieldFocused, setIsSearchFieldFocused] = useState(false);
    // Get view mode from localStorage, default to 'list'
    const [viewMode, setViewMode] = useState<'list' | 'console'>(() => {
        const saved = localStorage.getItem(COLLECTION_VIEW_KEY);
        return (saved === 'console' || saved === 'list') ? saved : 'list';
    });
    const navigate = useNavigate();
    const { consoleName } = useParams<{ consoleName?: string }>();

    const authService = useAuthService();
    const { isEnabled: isPriceChartingEnabled } = usePriceCharting();

    // Barcode scanner integration
    const handleBarcodeScanned = React.useCallback(async (barcode: string) => {
        console.log('🔍 Complete barcode scanned, setting search value:', barcode);
        setIsProgrammaticUpdate(true);
        setSearchValue(barcode);
        setLastBarcodeSearch(barcode); // Track this as a barcode search
        // Reset the flag after a brief delay
        setTimeout(() => setIsProgrammaticUpdate(false), 100);
    }, []);

    // Function to search PriceCharting when barcode not found in collection
    const searchPriceChartingForBarcode = React.useCallback(async (barcode: string) => {
        try {
            console.log('🔍 No games found in collection, searching PriceCharting for UPC:', barcode);
            
            const priceChartingApiService = createPriceChartingApiService(authService);
            const results = await priceChartingApiService.searchPricing({ upc: barcode });
            
            if (results.length > 0) {
                const firstResult = results[0];
                console.log('✅ Found PriceCharting match:', firstResult);
                
                // Navigate to Add Game with pre-populated data
                navigate('/add-game', {
                    state: {
                        autoPopulate: {
                            name: firstResult.name,
                            consoleName: firstResult.consoleName,
                            upc: barcode,
                            priceChartingId: firstResult.priceChartingId,
                            pricing: {
                                complete: firstResult.completeInBoxPrice,
                                loose: firstResult.loosePrice,
                                new: firstResult.newPrice
                            }
                        }
                    }
                });
            } else {
                console.log('❌ No PriceCharting matches found for UPC:', barcode);
                // Could show a notification here that no matches were found
            }
        } catch (error) {
            console.error('❌ Failed to search PriceCharting:', error);
            // Could show error notification here
        }
    }, [authService, navigate]);

    const { clearBuffer } = useBarcodeScanner({
        onBarcodeScanned: handleBarcodeScanned,
        onScanningStarted: () => {
            console.log('📱 Barcode scanning started - clearing search field');
            setIsProgrammaticUpdate(true);
            setSearchValue(''); // Clear existing search when new scan starts
            setIsScanning(true);
            // Reset the flag after a brief delay
            setTimeout(() => setIsProgrammaticUpdate(false), 100);
        },
        onScanningEnded: () => {
            console.log('📱 Barcode scanning ended');
            setIsScanning(false);
        },
        enabled: !isProgrammaticUpdate && !isSearchFieldFocused, // Disable scanner during programmatic updates or when typing
        minLength: 8,  // Minimum barcode length
        maxLength: 30, // Maximum barcode length
        timeout: 100   // Timeout between keystrokes to detect scanner vs typing
    });

    // Custom view mode setter that saves to localStorage
    const updateViewMode = React.useCallback((mode: 'list' | 'console') => {
        setViewMode(mode);
        localStorage.setItem(COLLECTION_VIEW_KEY, mode);
    }, []);

    // Custom hooks
    const pagination = usePagination({ 
        initialPageSize: 20, 
        pageKey: consoleName ? `collection-${consoleName}` : 'collection-main' 
    });
    const { games, loading, paginationLoading, error, paginationEnabled, totalGames, totalPages } = useGamesData({
        viewMode,
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        hasSelectedConsole: Boolean(consoleName),
        searchTerm: debouncedSearchValue
    });

    // Track the last barcode search to check if we need to search PriceCharting
    const [lastBarcodeSearch, setLastBarcodeSearch] = React.useState<string | null>(null);

    // Sync pagination data when games are loaded
    React.useEffect(() => {
        if (paginationEnabled) {
            pagination.setPaginationData({
                totalPages: totalPages,
                totalItems: totalGames,
                enabled: paginationEnabled
            });
        }
    }, [paginationEnabled, totalPages, totalGames, pagination.setPaginationData]);

    // Calculate console data from real games
    const platformColorMap: Record<string, string> = {
        'PlayStation': 'bg-blue-600',
        'Xbox': 'bg-green-600',
        'Nintendo': 'bg-red-600',
        'PC': 'bg-purple-600',
        'Steam': 'bg-orange-600'
    };

    const getPlatformColor = (platformName: string): string => {
        for (const [key, color] of Object.entries(platformColorMap)) {
            if (platformName.toLowerCase().includes(key.toLowerCase())) {
                return color;
            }
        }
        return 'bg-gray-600';
    };

    const consoles = React.useMemo(() => {
        const platformGroups = games.reduce((acc, game) => {
            const platformName = game.platform.description;
            if (!acc[platformName]) {
                acc[platformName] = {
                    name: platformName,
                    company: "Various Publishers",
                    gameCount: 0,
                    color: getPlatformColor(platformName),
                    icon: platformName.toLowerCase().includes('pc') || platformName.toLowerCase().includes('steam') ? "💻" : "🎮"
                };
            }
            acc[platformName].gameCount += 1;
            return acc;
        }, {} as Record<string, Console>);

        return Object.values(platformGroups).sort((a, b) => b.gameCount - a.gameCount);
    }, [games]);

    // Find selected console from URL parameter
    const selectedConsole = consoleName
        ? consoles.find(c => consoleNameToSlug(c.name) === consoleName.toLowerCase())
        : null;

    // Filter games based on selected console only
    // Note: Search filtering is handled server-side by the API via searchTerm parameter
    const filteredGames = React.useMemo(() => {
        let filtered = games;

        // Only filter by selected console - search is handled by the API
        if (selectedConsole) {
            console.log('🏮 Filtering by selected console:', selectedConsole.name);
            filtered = filtered.filter(game => game.platform.description === selectedConsole.name);
        }

        console.log('🔍 Final filtered games:', filtered.length, 'Search handled by API:', !!debouncedSearchValue);
        return filtered;
    }, [games, selectedConsole, debouncedSearchValue]);

    // Check if we need to search PriceCharting after games are loaded
    React.useEffect(() => {
        // Only check if this was a barcode search, games are loaded, no games found, and PriceCharting is enabled
        if (lastBarcodeSearch && 
            !loading && 
            !paginationLoading && 
            filteredGames.length === 0 && 
            isPriceChartingEnabled && 
            debouncedSearchValue === lastBarcodeSearch) {
            
            console.log('🔍 Barcode search completed with no results, checking PriceCharting');
            searchPriceChartingForBarcode(lastBarcodeSearch);
            setLastBarcodeSearch(null); // Clear to prevent repeated searches
        }
    }, [lastBarcodeSearch, loading, paginationLoading, filteredGames.length, isPriceChartingEnabled, debouncedSearchValue, searchPriceChartingForBarcode]);

    // Set view mode based on console selection and screen size
    useEffect(() => {
        if (selectedConsole) {
            // Always use list view when viewing a specific console
            setViewMode('list');
        } else if (consoleName) {
            // Invalid console name in URL, redirect to main collection
            navigate('/collection', { replace: true });
        } else {
            // For main collection page, force list view on mobile but respect saved preference on desktop
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                setViewMode('list');
            }
            // On desktop, keep the saved preference (already loaded from localStorage)
        }
    }, [selectedConsole, consoleName, navigate]);

    // Persist search value to localStorage whenever it changes
    useEffect(() => {
        if (searchValue) {
            localStorage.setItem(COLLECTION_SEARCH_KEY, searchValue);
        } else {
            localStorage.removeItem(COLLECTION_SEARCH_KEY);
        }
    }, [searchValue]);

    // Reset pagination when switching views or search changes
    useEffect(() => {
        pagination.resetToFirstPage();
    }, [viewMode, debouncedSearchValue, pagination.resetToFirstPage]);

    // Listen for window resize to adjust view mode
    useEffect(() => {
        const handleResize = () => {
            if (!selectedConsole) {
                const isMobile = window.innerWidth < 768;
                if (isMobile) {
                    // Force list view on mobile
                    setViewMode('list');
                } else {
                    // On desktop resize, restore saved preference
                    const saved = localStorage.getItem(COLLECTION_VIEW_KEY);
                    const preferredMode = (saved === 'console' || saved === 'list') ? saved : 'list';
                    setViewMode(preferredMode);
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [selectedConsole]);

    // Handle console selection
    const handleConsoleClick = (console: Console) => {
        const consoleSlug = consoleNameToSlug(console.name);
        navigate(`/collection/console/${consoleSlug}`);
    };

    // Create breadcrumbs when console is selected
    const breadcrumbItems = selectedConsole ? [
        { label: "My Collection", path: "/collection" },
        { label: selectedConsole.name, path: "" }
    ] : [];

    return (
        <div className="w-full">
            {/* Breadcrumb Navigation - Show when console is selected */}
            {selectedConsole && (
                <Breadcrumb items={breadcrumbItems} />
            )}

            {/* New Streamlined Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0 mb-6">
                {/* Left: Title and Count */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl lg:text-3xl font-bold text-white">
                        {selectedConsole ? selectedConsole.name : 'My Collection'}
                    </h1>
                    <span className="text-sm lg:text-base text-gray-400 leading-none">
                        {selectedConsole
                            ? `${filteredGames.length} games`
                            : `${totalGames || filteredGames.length} games`
                        }
                    </span>
                </div>

                {/* Right: Search and View Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    {/* Collection Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                        <input
                            type="text"
                            placeholder="Search your collection..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onFocus={() => {
                                console.log('🔍 Search field focused - disabling barcode scanner');
                                setIsSearchFieldFocused(true);
                            }}
                            onBlur={() => {
                                console.log('🔍 Search field blurred - enabling barcode scanner');
                                setIsSearchFieldFocused(false);
                            }}
                            className="w-full sm:w-80 pl-10 pr-10 py-2 bg-slate-800 border border-slate-700 rounded-lg
                                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                   focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                            aria-label="Search game collection"
                        />
                        {searchValue && (
                            <button
                                onClick={() => setSearchValue('')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* View Mode Toggle - Only show when not viewing specific console */}
                    {!selectedConsole && (
                        <div className="flex sm:hidden md:flex items-center bg-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => updateViewMode('list')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors flex-1 sm:flex-initial ${
                                    viewMode === 'list'
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <List size={16}/>
                                List
                            </button>
                            <button
                                onClick={() => updateViewMode('console')}
                                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors flex-1 sm:flex-initial ${
                                    viewMode === 'console'
                                        ? 'bg-cyan-500 text-white'
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                <Grid3X3 size={16}/>
                                Console
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6 flex items-center gap-3">
                    <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="text-red-400 font-medium">Failed to load games</h3>
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

            {/* Loading State */}
            {loading && !error && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                    <span className="ml-3 text-gray-400">Loading your games...</span>
                </div>
            )}

            {/* Content Area - List or Console View */}
            {!loading && !error && (
                <div className="bg-slate-800 rounded-lg border border-slate-700 relative">
                    {/* Pagination Loading Overlay */}
                    {paginationLoading && (
                        <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center gap-3 text-cyan-400">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                                <span className="text-sm">Loading...</span>
                            </div>
                        </div>
                    )}
                    {(viewMode === 'list' || selectedConsole) ? (
                        <>
                            {/* Table Header with Add Game Button and Pagination Info */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                                <div className="text-sm text-gray-400">
                                    {paginationEnabled ? (
                                        `Showing ${((pagination.currentPage - 1) * pagination.pageSize) + 1}-${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems || 0)} of ${pagination.totalItems || 0} games`
                                    ) : (
                                        `Showing ${filteredGames.length} games`
                                    )}
                                </div>
                                <button
                                    onClick={() => navigate('/add-game')}
                                    className="flex items-center gap-2 px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors text-sm"
                                >
                                    <Plus size={16}/>
                                    Add Game
                                </button>
                            </div>

                            {/* Games List Table */}
                            <div className="p-6">
                                <GamesTable games={filteredGames} selectedConsole={selectedConsole} searchValue={searchValue} />
                            </div>

                            {/* Pagination - Only show when pagination is enabled */}
                            {paginationEnabled && (
                                <div className="px-6 py-3 border-t border-slate-700">
                                    <PaginationControls
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        pageSize={pagination.pageSize}
                                        totalItems={pagination.totalItems}
                                        onPageChange={pagination.handlePageChange}
                                        onNextPage={pagination.handleNextPage}
                                        onPreviousPage={pagination.handlePreviousPage}
                                    />
                                </div>
                            )}

                            {/* Simple pagination info for non-paginated views */}
                            {!paginationEnabled && filteredGames.length > 0 && (
                                <div className="flex items-center justify-center px-6 py-3 border-t border-slate-700">
                                    <div className="text-gray-400 text-sm">
                                        Showing all {filteredGames.length} games
                                        {selectedConsole && ` on ${selectedConsole.name}`}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Console Grid Header */}
                            <div className="flex items-center justify-between p-4 border-b border-slate-700">
                                <div className="text-sm text-gray-400">
                                    Showing consoles with games in your collection
                                </div>
                                <button
                                    onClick={() => navigate('/add-game')}
                                    className="flex items-center gap-2 px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors text-sm"
                                >
                                    <Plus size={16}/>
                                    Add Game
                                </button>
                            </div>

                            {/* Console Cards Grid */}
                            <div className="p-6">
                                <ConsolesGrid games={games} onConsoleClick={handleConsoleClick} />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};