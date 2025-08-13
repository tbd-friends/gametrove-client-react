import React from 'react';
import {useNavigate} from 'react-router-dom';
import {Plus, List, Grid3X3, Search} from 'lucide-react';

interface Console {
    name: string;
}

interface CollectionHeaderProps {
    selectedConsole?: Console | null;
    filteredGamesCount: number;
    viewMode: 'list' | 'console';
    searchValue: string;
    onViewModeChange: (mode: 'list' | 'console') => void;
    onSearchChange: (value: string) => void;
}

export const CollectionHeader: React.FC<CollectionHeaderProps> = ({
                                                                      selectedConsole,
                                                                      filteredGamesCount,
                                                                      viewMode,
                                                                      searchValue,
                                                                      onViewModeChange,
                                                                      onSearchChange
                                                                  }) => {
    const navigate = useNavigate();

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {selectedConsole ? selectedConsole.name : 'My Collection'}
                    </h1>
                    <p className="text-gray-400">
                        {selectedConsole
                            ? `${filteredGamesCount} games on ${selectedConsole.name}`
                            : 'Track and manage your game library'
                        }
                    </p>
                </div>
                <button
                    onClick={() => navigate('/add-game')}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
                >
                    <Plus size={20}/>
                    Add Game
                </button>
            </div>

            {/* Collection Section Header */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-xl font-semibold text-white">
                        {selectedConsole ? `${selectedConsole.name} Games` : 'Game Collection'}
                    </h2>
                    {!selectedConsole && (
                        <div className="hidden md:flex items-center gap-4">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-slate-700 rounded-lg p-1">
                                <button
                                    onClick={() => onViewModeChange('list')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-cyan-500 text-white'
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <List size={16}/>
                                    List
                                </button>
                                <button
                                    onClick={() => onViewModeChange('console')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                                        viewMode === 'console'
                                            ? 'bg-cyan-500 text-white'
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <Grid3X3 size={16}/>
                                    Console
                                </button>
                            </div>

                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20}/>
                    <input
                        type="text"
                        placeholder="Search your game collection..."
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                       focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                        aria-label="Search game collection"
                    />
                </div>
            </div>
        </>
    );
};