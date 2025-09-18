import React, { useEffect } from "react";
import { AlertCircle, Search, List, Grid3X3, Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/common";
import { consoleNameToSlug } from "../utils/slugUtils";
import {
  usePagination,
  useGamesData,
  useCollectionSearch,
  useViewMode,
  useBarcodeIntegration,
  useConsoleData
} from "../hooks";
import { logger } from "../../shared/utils/logger";
import {
  GamesTable,
  ConsolesGrid,
  PaginationControls
} from "../components/collection";

export const MyCollection: React.FC = () => {
  const navigate = useNavigate();
  const { consoleName } = useParams<{ consoleName?: string }>();

  // Core hooks - single source of truth
  const { searchValue, debouncedSearchValue, setSearchValue, isSearchFieldFocused, setIsSearchFieldFocused } = useCollectionSearch();
  const { viewMode, updateViewMode } = useViewMode(Boolean(consoleName));
  const { lastBarcodeSearch, setLastBarcodeSearch, searchPriceChartingForBarcode } = useBarcodeIntegration(setSearchValue, isSearchFieldFocused);

  const pagination = usePagination({
    initialPageSize: 20,
    pageKey: consoleName ? `collection-${consoleName}` : 'collection-main'
  });

  // Single games data call with proper viewMode
  const { games, loading, paginationLoading, error, paginationEnabled, totalGames, totalPages } = useGamesData({
    viewMode,
    currentPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    hasSelectedConsole: Boolean(consoleName),
    searchTerm: debouncedSearchValue
  });

  const { selectedConsole, filteredGames } = useConsoleData(games, debouncedSearchValue);

  // Effects
  useEffect(() => {
    if (paginationEnabled) {
      pagination.setPaginationData({
        totalPages,
        totalItems: totalGames,
        enabled: paginationEnabled
      });
    }
  }, [paginationEnabled, totalPages, totalGames, pagination]);

  useEffect(() => {
    if (lastBarcodeSearch && !loading && !paginationLoading && filteredGames.length === 0 && debouncedSearchValue === lastBarcodeSearch) {
      logger.info('Barcode search completed with no results, checking PriceCharting', undefined, 'USER');
      void searchPriceChartingForBarcode(lastBarcodeSearch);
      setLastBarcodeSearch(null);
    }
  }, [lastBarcodeSearch, loading, paginationLoading, filteredGames.length, debouncedSearchValue, searchPriceChartingForBarcode, setLastBarcodeSearch]);

  useEffect(() => {
    if (consoleName && !selectedConsole && games.length > 0) {
      navigate('/collection', { replace: true });
    }
  }, [consoleName, selectedConsole, games.length, navigate]);

  useEffect(() => {
    pagination.resetToFirstPage();
  }, [viewMode, debouncedSearchValue, pagination]);

  const handleConsoleClick = (console: { name: string }) => {
    navigate(`/collection/console/${consoleNameToSlug(console.name)}`);
  };

  const breadcrumbItems = selectedConsole ? [
    { label: "My Collection", path: "/collection" },
    { label: selectedConsole.name, path: "" }
  ] : [];

  if (loading && !error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        <span className="ml-3 text-gray-400">Loading your games...</span>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  return (
    <div className="w-full">
      {selectedConsole && <Breadcrumb items={breadcrumbItems} />}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-0 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            {selectedConsole ? selectedConsole.name : 'My Collection'}
          </h1>
          <span className="text-sm lg:text-base text-gray-400 leading-none">
            {selectedConsole ? `${filteredGames.length} games` : `${totalGames || filteredGames.length} games`}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
            <input
              type="text"
              placeholder="Search your collection..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => {
                logger.info('Search field focused - disabling barcode scanner', undefined, 'USER');
                setIsSearchFieldFocused(true);
              }}
              onBlur={() => {
                logger.info('Search field blurred - enabling barcode scanner', undefined, 'USER');
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

          {/* View Mode Toggle */}
          {!selectedConsole && (
            <div className="flex sm:hidden md:flex items-center bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => updateViewMode('list')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors flex-1 sm:flex-initial ${
                  viewMode === 'list' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <List size={16}/> List
              </button>
              <button
                onClick={() => updateViewMode('console')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm transition-colors flex-1 sm:flex-initial ${
                  viewMode === 'console' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Grid3X3 size={16}/> Console
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 relative">
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
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="text-sm text-gray-400">
                {paginationEnabled
                  ? `Showing ${((pagination.currentPage - 1) * pagination.pageSize) + 1}-${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems || 0)} of ${pagination.totalItems || 0} games`
                  : `Showing ${filteredGames.length} games`
                }
              </div>
              <button
                onClick={() => navigate('/add-game')}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors text-sm"
              >
                <Plus size={16}/> Add Game
              </button>
            </div>

            <div className="p-6">
              <GamesTable games={filteredGames} selectedConsole={selectedConsole} searchValue={searchValue} />
            </div>

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

            {!paginationEnabled && filteredGames.length > 0 && (
              <div className="flex items-center justify-center px-6 py-3 border-t border-slate-700">
                <div className="text-gray-400 text-sm">
                  Showing all {filteredGames.length} games{selectedConsole && ` on ${selectedConsole.name}`}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="text-sm text-gray-400">
                Showing consoles with games in your collection
              </div>
              <button
                onClick={() => navigate('/add-game')}
                className="flex items-center gap-2 px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors text-sm"
              >
                <Plus size={16}/> Add Game
              </button>
            </div>

            <div className="p-6">
              <ConsolesGrid games={games} onConsoleClick={handleConsoleClick} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
