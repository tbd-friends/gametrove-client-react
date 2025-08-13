import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/common";
import { consoleNameToSlug } from "../utils/slugUtils";
import { usePagination, useGamesData } from "../hooks";
import {
  CollectionHeader,
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

export const MyCollection: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'console'>('console');
    const navigate = useNavigate();
    const { consoleName } = useParams<{ consoleName?: string }>();

    // Custom hooks
    const pagination = usePagination({ initialPageSize: 20 });
    const { games, loading, error, paginationEnabled, totalGames, totalPages } = useGamesData({
        viewMode,
        currentPage: pagination.currentPage,
        pageSize: pagination.pageSize,
        hasSelectedConsole: Boolean(consoleName),
        searchTerm: searchValue
    });

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

    // Filter games based on selected console and search
    const filteredGames = React.useMemo(() => {
        let filtered = games;

        // Filter by selected console
        if (selectedConsole) {
            filtered = filtered.filter(game => game.platform.description === selectedConsole.name);
        }

        // Filter by search term
        if (searchValue.trim()) {
            const searchLower = searchValue.toLowerCase();
            filtered = filtered.filter(game =>
                game.description.toLowerCase().includes(searchLower) ||
                game.platform.description.toLowerCase().includes(searchLower) ||
                game.publisher?.description.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [games, selectedConsole, searchValue]);

    // Set view mode based on console selection and screen size
    useEffect(() => {
        if (selectedConsole) {
            setViewMode('list');
        } else if (consoleName) {
            // Invalid console name in URL, redirect to main collection
            navigate('/collection', { replace: true });
        } else {
            // Force list view on mobile, console view on desktop
            const isMobile = window.innerWidth < 768;
            setViewMode(isMobile ? 'list' : 'console');
        }
    }, [selectedConsole, consoleName, navigate]);

    // Reset pagination when switching views or search changes
    useEffect(() => {
        pagination.resetToFirstPage();
    }, [viewMode, searchValue, pagination.resetToFirstPage]);

    // Listen for window resize to adjust view mode
    useEffect(() => {
        const handleResize = () => {
            if (!selectedConsole) {
                const isMobile = window.innerWidth < 768;
                setViewMode(isMobile ? 'list' : 'console');
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

            {/* Collection Header with Search and Controls */}
            <CollectionHeader
                selectedConsole={selectedConsole}
                filteredGamesCount={filteredGames.length}
                viewMode={viewMode}
                searchValue={searchValue}
                onViewModeChange={setViewMode}
                onSearchChange={setSearchValue}
            />

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
                <div className="mt-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
                    {(viewMode === 'list' || selectedConsole) ? (
                        <>
                            {/* Games List Table */}
                            <GamesTable games={filteredGames} selectedConsole={selectedConsole} searchValue={searchValue} />

                            {/* Pagination - Only show when pagination is enabled */}
                            {paginationEnabled && (
                                <PaginationControls
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    pageSize={pagination.pageSize}
                                    totalItems={pagination.totalItems}
                                    onPageChange={pagination.handlePageChange}
                                    onNextPage={pagination.handleNextPage}
                                    onPreviousPage={pagination.handlePreviousPage}
                                />
                            )}

                            {/* Simple pagination info for non-paginated views */}
                            {!paginationEnabled && filteredGames.length > 0 && (
                                <div className="flex items-center justify-center mt-6">
                                    <div className="text-gray-400 text-sm">
                                        Showing all {filteredGames.length} games
                                        {selectedConsole && ` on ${selectedConsole.name}`}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Console Cards Grid */
                        <ConsolesGrid games={games} onConsoleClick={handleConsoleClick} />
                    )}
                </div>
            )}
        </div>
    );
};