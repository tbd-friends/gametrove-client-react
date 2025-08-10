import React, { useState } from "react";
import { ArrowLeft, Star, Edit, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumb } from "../components/common";
import { slugToDisplayName } from "../utils/slugUtils";

export const GameDetail: React.FC = () => {
    const navigate = useNavigate();
    const { gameId, consoleName } = useParams<{ gameId: string; consoleName?: string }>();
    const [activeTab, setActiveTab] = useState<'details' | 'copies'>('details');

    // Mock game data - in real app this would come from API based on gameId
    const game = {
        id: parseInt(gameId || "1"),
        title: "Sonic the Hedgehog",
        platform: "Sega Genesis",
        publisher: "Sega",
        developer: "Sonic Team",
        year: 1991,
        rating: 4.8,
        reviewCount: 245,
        esrb: "E",
        genres: ["Platformer", "Action", "Adventure"],
        synopsis: "Sonic the Hedgehog is a platform game developed by Sonic Team and published by Sega for the Sega Genesis console. The game follows Sonic, a blue hedgehog who can run at supersonic speeds, as he attempts to defeat the evil Dr. Robotnik, who has imprisoned animals in robots and stolen the Chaos Emeralds. The gameplay involves collecting rings, avoiding obstacles, and running through various levels at high speed.",
        coverImage: "🎮",
        screenshots: [
            { id: 1, url: "🌴", title: "Green Hill Zone" },
            { id: 2, url: "❄️", title: "Ice Cap Zone" },
            { id: 3, url: "🏜️", title: "Desert Zone" },
            { id: 4, url: "🌊", title: "Labyrinth Zone" }
        ],
        collectionStats: {
            totalCopies: 2,
            estimatedValue: 85.00,
            dateAdded: "March 15, 2024",
            condition: "Very Good"
        },
        releaseDate: "June 23, 1991"
    };

    // Create breadcrumbs based on routing context
    const breadcrumbItems = consoleName
        ? [
            { label: "My Collection", path: "/collection" },
            { label: slugToDisplayName(consoleName), path: `/collection/console/${consoleName}` },
            { label: game.title, path: "" }
        ]
        : [
            { label: "My Collection", path: "/collection" },
            { label: game.title, path: "" }
        ];

    const handleEditGame = () => {
        // Navigate to edit game page or open edit modal
        console.log("Edit game:", game.id);
    };

    const handleRemoveFromCollection = () => {
        // Show confirmation dialog and remove game
        if (window.confirm(`Are you sure you want to remove "${game.title}" from your collection?`)) {
            console.log("Remove game:", game.id);
            if (consoleName) {
                navigate(`/collection/console/${consoleName}`);
            } else {
                navigate('/collection');
            }
        }
    };

    return (
        <div className="w-full">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Game Header */}
            <div className="flex items-start gap-6 mb-8">
                {/* Game Cover */}
                <div className="w-48 h-64 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-6xl flex-shrink-0 relative">
                    {game.coverImage}
                    {/* ESRB Rating Badge */}
                    <div className="absolute top-2 left-2 bg-slate-900 border border-slate-600 rounded px-2 py-1">
                        <span className="text-white text-xs font-bold">ESRB: {game.esrb}</span>
                    </div>
                </div>

                {/* Game Info */}
                <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2">{game.title}</h1>
                    <p className="text-gray-400 text-lg mb-4">
                        {game.platform} • {game.publisher} • {game.year}
                    </p>
                    
                    {/* Genre Tags */}
                    <div className="flex gap-2 mb-4">
                        {game.genres.map((genre) => (
                            <span
                                key={genre}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    genre === "Platformer" ? "bg-blue-600 text-white" :
                                    genre === "Action" ? "bg-green-600 text-white" :
                                    "bg-purple-600 text-white"
                                }`}
                            >
                                {genre}
                            </span>
                        ))}
                    </div>

                    {/* Rating and ESRB */}
                    <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2">
                            <Star className="text-yellow-400 fill-current" size={20} />
                            <span className="text-white font-semibold">{game.rating}</span>
                            <span className="text-gray-400">({game.reviewCount} reviews)</span>
                        </div>
                        <div className="text-gray-400">
                            ESRB: <span className="text-white font-medium">{game.esrb}</span>
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
                        Copies ({game.collectionStats.totalCopies})
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
                            <p className="text-gray-300 leading-relaxed">{game.synopsis}</p>
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
                                    <span className="text-white">{game.developer}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Publisher:</span>
                                    <span className="text-white">{game.publisher}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Release Date:</span>
                                    <span className="text-white">{game.releaseDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Platform:</span>
                                    <span className="text-white">{game.platform}</span>
                                </div>
                            </div>
                        </div>

                        {/* Collection Stats */}
                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Collection Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Copies:</span>
                                    <span className="text-green-400 font-semibold">{game.collectionStats.totalCopies}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Estimated Value:</span>
                                    <span className="text-green-400 font-semibold">${game.collectionStats.estimatedValue.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Date Added:</span>
                                    <span className="text-white">{game.collectionStats.dateAdded}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Condition:</span>
                                    <span className="text-white">{game.collectionStats.condition}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screenshots */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Screenshots</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {game.screenshots.map((screenshot) => (
                                <div
                                    key={screenshot.id}
                                    className="aspect-video bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-4xl hover:bg-slate-700 transition-colors cursor-pointer"
                                    title={screenshot.title}
                                >
                                    {screenshot.url}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'copies' && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Your Copies</h3>
                    <div className="space-y-4">
                        {Array.from({ length: game.collectionStats.totalCopies }, (_, index) => (
                            <div key={index} className="bg-slate-700 rounded-lg p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="text-white font-medium">Copy #{index + 1}</h4>
                                        <p className="text-gray-400 text-sm">Condition: Very Good • Complete in Box</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-green-400 font-semibold">${(game.collectionStats.estimatedValue / game.collectionStats.totalCopies).toFixed(2)}</p>
                                        <p className="text-gray-400 text-sm">Estimated Value</p>
                                    </div>
                                </div>
                            </div>
                        ))}
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
        </div>
    );
};