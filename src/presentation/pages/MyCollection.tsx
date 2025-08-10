import React, { useState, useEffect } from "react";
import { Gamepad2, Copy, Monitor, Heart, Search, List, Grid3X3, Filter, ChevronRight, Plus, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/common";
import { consoleNameToSlug, slugToDisplayName } from "../utils/slugUtils";

export const MyCollection: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'console'>('console');
    const navigate = useNavigate();
    const { consoleName } = useParams<{ consoleName?: string }>();

    const statsCards = [
        {
            title: "Total Games",
            value: "247",
            icon: <Gamepad2 size={24} className="text-cyan-400" />,
        },
        {
            title: "Total Copies", 
            value: "312",
            icon: <Copy size={24} className="text-green-400" />,
        },
        {
            title: "Consoles",
            value: "12", 
            icon: <Monitor size={24} className="text-gray-400" />,
        },
        {
            title: "Wishlist",
            value: "23",
            icon: <Heart size={24} className="text-red-400" />,
        }
    ];

    const consoles = [
        {
            name: "PlayStation 5",
            company: "Sony Interactive",
            gameCount: 87,
            color: "bg-blue-600",
            icon: "🎮"
        },
        {
            name: "Xbox Series X/S", 
            company: "Microsoft",
            gameCount: 64,
            color: "bg-green-600",
            icon: "🎮"
        },
        {
            name: "Nintendo Switch",
            company: "Nintendo", 
            gameCount: 43,
            color: "bg-red-600",
            icon: "🎮"
        },
        {
            name: "PC",
            company: "Various Publishers",
            gameCount: 32,
            color: "bg-purple-600",
            icon: "💻"
        },
        {
            name: "PlayStation 4",
            company: "Sony Interactive",
            gameCount: 21,
            color: "bg-blue-600",
            icon: "🎮"
        },
        {
            name: "Xbox One",
            company: "Microsoft",
            gameCount: 18,
            color: "bg-green-600", 
            icon: "🎮"
        },
        {
            name: "Nintendo 3DS",
            company: "Nintendo",
            gameCount: 15,
            color: "bg-red-600",
            icon: "🎮"
        },
        {
            name: "Steam Deck",
            company: "Valve",
            gameCount: 12,
            color: "bg-orange-600",
            icon: "🎮"
        },
        {
            name: "PlayStation 3",
            company: "Sony Interactive",
            gameCount: 9,
            color: "bg-blue-600",
            icon: "🎮"
        },
        {
            name: "Xbox 360",
            company: "Microsoft",
            gameCount: 7,
            color: "bg-green-600",
            icon: "🎮"
        },
        {
            name: "Nintendo Wii",
            company: "Nintendo",
            gameCount: 5,
            color: "bg-red-600",
            icon: "🎮"
        }
    ];

    const games = [
        {
            id: 1,
            title: "Cyberpunk 2077",
            platform: "PlayStation 5",
            publisher: "CD Projekt Red",
            copies: 3,
            image: "👨‍💼"
        },
        {
            id: 2,
            title: "The Legend of Zelda: Breath of the Wild", 
            platform: "Nintendo Switch",
            publisher: "Nintendo",
            copies: 1,
            image: "🗡️"
        },
        {
            id: 3,
            title: "Halo Infinite",
            platform: "Xbox Series X",
            publisher: "Microsoft",
            copies: 2,
            image: "🚀"
        },
        {
            id: 4,
            title: "God of War Ragnarök",
            platform: "PlayStation 5",
            publisher: "Sony Interactive",
            copies: 1,
            image: "⚔️"
        },
        {
            id: 5,
            title: "Elden Ring",
            platform: "PC",
            publisher: "FromSoftware",
            copies: 1,
            image: "🏰"
        },
        {
            id: 6,
            title: "Spider-Man: Miles Morales",
            platform: "PlayStation 5",
            publisher: "Sony Interactive",
            copies: 1,
            image: "🕷️"
        },
        {
            id: 7,
            title: "Forza Horizon 5",
            platform: "Xbox Series X",
            publisher: "Microsoft",
            copies: 1,
            image: "🏎️"
        },
        {
            id: 8,
            title: "Super Mario Odyssey",
            platform: "Nintendo Switch",
            publisher: "Nintendo",
            copies: 1,
            image: "🍄"
        },
        {
            id: 9,
            title: "The Witcher 3: Wild Hunt",
            platform: "PC",
            publisher: "CD Projekt Red",
            copies: 1,
            image: "🗺️"
        },
        {
            id: 10,
            title: "Horizon Forbidden West",
            platform: "PlayStation 5",
            publisher: "Sony Interactive",
            copies: 1,
            image: "🏹"
        }
    ];

    // Find selected console from URL parameter
    const selectedConsole = consoleName 
        ? consoles.find(c => consoleNameToSlug(c.name) === consoleName.toLowerCase())
        : null;

    // Set view mode based on console selection and screen size
    useEffect(() => {
        if (selectedConsole) {
            setViewMode('list');
        } else if (consoleName) {
            // Invalid console name in URL, redirect to main collection
            navigate('/collection', { replace: true });
        } else {
            // Force list view on mobile, console view on desktop
            const isMobile = window.innerWidth < 768; // md breakpoint
            setViewMode(isMobile ? 'list' : 'console');
        }
    }, [selectedConsole, consoleName, navigate]);

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

    // Filter games by selected console
    const filteredGames = selectedConsole 
        ? games.filter(game => game.platform === selectedConsole.name)
        : games;

    // Handle console selection
    const handleConsoleClick = (console: any) => {
        const consoleSlug = consoleNameToSlug(console.name);
        navigate(`/collection/console/${consoleSlug}`);
    };

    // Handle back to console view
    const handleBackToConsoles = () => {
        navigate('/collection');
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

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {selectedConsole ? selectedConsole.name : 'My Collection'}
                    </h1>
                    <p className="text-gray-400">
                        {selectedConsole 
                            ? `${filteredGames.length} games on ${selectedConsole.name}`
                            : 'Track and manage your game library'
                        }
                    </p>
                </div>
                <button 
                    onClick={() => navigate('/add-game')}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors"
                >
                    <Plus size={20} />
                    Add Game
                </button>
            </div>

            {/* Stats Cards - Only show when not filtering by console and not on mobile */}
            {!selectedConsole && (
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statsCards.map((stat) => (
                        <div key={stat.title} className="bg-slate-800 rounded-lg p-6 border border-slate-700 relative">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className="absolute top-4 right-4">
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Game Collection Section */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                        {selectedConsole ? `${selectedConsole.name} Games` : 'Game Collection'}
                    </h2>
                    {!selectedConsole && (
                        <div className="hidden md:flex items-center gap-4">
                            {/* View Mode Toggle */}
                            <div className="flex items-center bg-slate-700 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                                        viewMode === 'list' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <List size={16} />
                                    List
                                </button>
                                <button
                                    onClick={() => setViewMode('console')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-colors ${
                                        viewMode === 'console' 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-gray-300 hover:text-white'
                                    }`}
                                >
                                    <Grid3X3 size={16} />
                                    Console
                                </button>
                            </div>

                            {/* Filter Button */}
                            <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors">
                                <Filter size={16} />
                                Filter
                            </button>
                        </div>
                    )}
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search your game collection..."
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-lg
                                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                   focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                        aria-label="Search game collection"
                    />
                </div>

                {/* Content Area - List or Console View */}
                {(viewMode === 'list' || selectedConsole) ? (
                    /* Games List Table */
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-600">
                                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Title</th>
                                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Platform</th>
                                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Publisher</th>
                                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Copies</th>
                                    <th className="text-left text-gray-400 text-sm font-medium pb-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredGames.map((game) => (
                                    <tr 
                                        key={game.id} 
                                        onClick={() => {
                                            if (selectedConsole) {
                                                const consoleSlug = consoleNameToSlug(selectedConsole.name);
                                                navigate(`/collection/console/${consoleSlug}/game/${game.id}`);
                                            } else {
                                                navigate(`/collection/game/${game.id}`);
                                            }
                                        }}
                                        className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer"
                                    >
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-slate-600 rounded-lg flex items-center justify-center text-xl">
                                                    {game.image}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{game.title}</div>
                                                    <div className="text-gray-400 text-sm">Action</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                game.platform.includes('PlayStation') ? 'bg-blue-600 text-white' :
                                                game.platform.includes('Xbox') ? 'bg-green-600 text-white' :
                                                game.platform.includes('Nintendo') ? 'bg-red-600 text-white' :
                                                'bg-purple-600 text-white'
                                            }`}>
                                                {game.platform}
                                            </span>
                                        </td>
                                        <td className="py-3 text-gray-300">{game.publisher}</td>
                                        <td className="py-3">
                                            <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
                                                {game.copies}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Add copy for game:', game.id);
                                                }}
                                                className="text-cyan-400 hover:text-cyan-300 p-1 rounded-md hover:bg-slate-600 transition-colors"
                                                title="Add copy"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        <div className="flex items-center justify-between mt-6">
                            <div className="text-gray-400 text-sm">
                                Showing 1-{Math.min(10, filteredGames.length)} of {filteredGames.length} games
                                {selectedConsole && ` on ${selectedConsole.name}`}
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="px-3 py-2 bg-cyan-500 text-white rounded-md text-sm font-medium">
                                    1
                                </button>
                                <button className="px-3 py-2 bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white rounded-md text-sm font-medium transition-colors">
                                    2
                                </button>
                                <button className="px-3 py-2 bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white rounded-md text-sm font-medium transition-colors">
                                    3
                                </button>
                                <span className="px-2 text-gray-400">...</span>
                                <button className="px-3 py-2 bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white rounded-md text-sm font-medium transition-colors">
                                    25
                                </button>
                                <button className="px-3 py-2 bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white rounded-md text-sm font-medium transition-colors">
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Console Cards Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {consoles.map((console) => (
                            <div 
                                key={console.name} 
                                onClick={() => handleConsoleClick(console)}
                                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors group cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 ${console.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                                            {console.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold">{console.name}</h3>
                                            <p className="text-gray-400 text-sm">{console.company}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="text-2xl font-bold text-green-400">{console.gameCount}</div>
                                    <div className="text-gray-400 text-sm">Games</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}