import React, {useState, useEffect} from "react";
import {Gamepad2, Copy, Monitor, Building, MoreVertical, TrendingUp, AlertCircle} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {createPriceChartingApiService} from "../../infrastructure/api";
import type {PriceChartingHighlight} from "../../infrastructure/api";
import {useAuthService} from "../hooks/useAuthService";
import {usePriceCharting} from "../hooks";
import {formatPercentageChange} from "../utils/priceUtils";

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const authService = useAuthService();
    const {isEnabled: isPriceChartingEnabled} = usePriceCharting();

    // Price highlights state
    const [highlights, setHighlights] = useState<PriceChartingHighlight[]>([]);
    const [highlightsLoading, setHighlightsLoading] = useState(false);
    const [highlightsError, setHighlightsError] = useState<string | null>(null);

    // Load price highlights when PriceCharting is enabled
    useEffect(() => {
        async function loadHighlights() {
            if (!isPriceChartingEnabled || !authService.isAuthenticated || authService.isLoading) {
                return;
            }

            try {
                setHighlightsLoading(true);
                setHighlightsError(null);

                const priceChartingApiService = createPriceChartingApiService(authService);
                const highlightsData = await priceChartingApiService.getHighlights();

                setHighlights(highlightsData);
                console.log('✅ Loaded price highlights:', highlightsData);
            } catch (err) {
                console.error('❌ Failed to load price highlights:', err);
                setHighlightsError(err instanceof Error ? err.message : 'Failed to load price highlights');
            } finally {
                setHighlightsLoading(false);
            }
        }

        loadHighlights();
    }, [isPriceChartingEnabled, authService.isAuthenticated, authService]);

    const handleHighlightClick = (gameIdentifier: string) => {
        navigate(`/collection/game/${gameIdentifier}`);
    };

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
            title: "Platforms",
            value: "12", 
            icon: <Monitor size={24} className="text-gray-400" />,
        },
        {
            title: "Publishers",
            value: "89",
            icon: <Building size={24} className="text-yellow-400" />,
        }
    ];

    const recentGames = [
        {
            title: "Cyberpunk 2077",
            platform: "PlayStation 5 • CD Projekt Red",
            genre: "RPG",
            copies: 3,
            image: "bg-purple-600"
        },
        {
            title: "Breath of the Wild",
            platform: "Nintendo Switch • Nintendo",
            genre: "Adventure", 
            copies: 1,
            image: "bg-green-600"
        },
        {
            title: "Halo Infinite",
            platform: "Xbox Series X • Microsoft",
            genre: "Shooter",
            copies: 2, 
            image: "bg-blue-600"
        },
        {
            title: "God of War Ragnarök",
            platform: "PlayStation 5 • Sony Interactive",
            genre: "Action",
            copies: 1,
            image: "bg-gray-600"
        }
    ];

    return (
        <div className="w-full">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
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

            {/* Price Highlights Section - Only show if PriceCharting is enabled */}
            {isPriceChartingEnabled && (
                <div className="bg-slate-800 rounded-lg border border-slate-700 p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-orange-400" size={24} />
                        <h2 className="text-xl font-semibold text-white">Price Highlights</h2>
                        <span className="text-gray-400 text-sm">Games with significant price changes</span>
                    </div>

                    {/* Loading State */}
                    {highlightsLoading && (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400"></div>
                            <span className="ml-3 text-gray-400">Loading price highlights...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {highlightsError && !highlightsLoading && (
                        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
                            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="text-red-400 font-medium">Failed to load price highlights</h3>
                                <p className="text-gray-300 text-sm mt-1">{highlightsError}</p>
                            </div>
                        </div>
                    )}

                    {/* Success State - Highlights Grid */}
                    {!highlightsLoading && !highlightsError && highlights.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {highlights.map((highlight) => {
                                const changeFormatted = formatPercentageChange(highlight.differencePercentage);
                                
                                return (
                                    <div
                                        key={highlight.gameIdentifier}
                                        onClick={() => handleHighlightClick(highlight.gameIdentifier)}
                                        className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-white font-semibold group-hover:text-cyan-400 transition-colors text-sm line-clamp-2">
                                                {highlight.name}
                                            </h3>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-400 text-xs">Price change:</span>
                                            <span className={`text-sm font-bold ${changeFormatted.colorClass}`}>
                                                {changeFormatted.displayText}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* No Data State */}
                    {!highlightsLoading && !highlightsError && highlights.length === 0 && (
                        <div className="text-center text-gray-400 py-8">
                            <TrendingUp className="mx-auto mb-3 text-gray-500" size={32} />
                            <p className="text-lg mb-2">No Price Highlights</p>
                            <p className="text-sm text-gray-500">
                                No games have significant price changes at the moment.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Recent Games Section */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Recent Games</h2>
                    <div className="flex items-center gap-4">
                        <select className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                            <option>All Platforms</option>
                        </select>
                        <button className="text-gray-400 hover:text-white">
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {recentGames.map((game) => (
                        <div key={game.title} className="bg-slate-700 rounded-lg overflow-hidden group hover:bg-slate-600 transition-colors">
                            <div className={`h-32 ${game.image} flex items-center justify-center relative`}>
                                {game.copies > 1 && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <Copy size={12} />
                                        {game.copies} copies
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="text-white font-semibold mb-1">{game.title}</h3>
                                <p className="text-gray-400 text-sm mb-2">{game.platform}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-cyan-400 text-sm bg-cyan-400/10 px-2 py-1 rounded">
                                        {game.genre}
                                    </span>
                                    <button className="text-gray-400 hover:text-white">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}