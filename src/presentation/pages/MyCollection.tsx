import React, { useState } from "react";
import { Gamepad2, Copy, Monitor, Heart, Search, List, Grid3X3, Filter, ChevronRight } from "lucide-react";

export const MyCollection: React.FC = () => {
    const [searchValue, setSearchValue] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'console'>('console');

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

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-2">My Collection</h1>
            <p className="text-gray-400 mb-8">Track and manage your game library</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Game Collection Section */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Game Collection</h2>
                    <div className="flex items-center gap-4">
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

                        {/* Platform Filter */}
                        <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
                            <option>All Platforms</option>
                            <option>PlayStation</option>
                            <option>Xbox</option>
                            <option>Nintendo</option>
                            <option>PC</option>
                        </select>

                        {/* Filter Button */}
                        <button className="flex items-center gap-2 px-3 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors">
                            <Filter size={16} />
                            Filter
                        </button>
                    </div>
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

                {/* Console Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {consoles.map((console) => (
                        <div key={console.name} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors group cursor-pointer">
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
            </div>
        </div>
    );
}