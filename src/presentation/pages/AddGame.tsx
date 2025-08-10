import React, { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Loader2, FileText, Image, Plus, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb } from "../components/common";

export const AddGame: React.FC = () => {
    const navigate = useNavigate();
    const [gameTitle, setGameTitle] = useState("");
    const [platform, setPlatform] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedGame, setSelectedGame] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [currentStep, setCurrentStep] = useState<'search' | 'configure'>('search');

    const platforms = [
        { value: "", label: "Select Platform" },
        { value: "playstation-5", label: "PlayStation 5" },
        { value: "xbox-series-x", label: "Xbox Series X/S" },
        { value: "nintendo-switch", label: "Nintendo Switch" },
        { value: "pc", label: "PC" },
        { value: "playstation-4", label: "PlayStation 4" },
        { value: "xbox-one", label: "Xbox One" },
        { value: "nintendo-3ds", label: "Nintendo 3DS" },
        { value: "steam-deck", label: "Steam Deck" },
        { value: "playstation-3", label: "PlayStation 3" },
        { value: "xbox-360", label: "Xbox 360" },
        { value: "nintendo-wii", label: "Nintendo Wii" },
        { value: "game-boy-advance", label: "Game Boy Advance" },
        { value: "playstation-2", label: "PlayStation 2" },
        { value: "sega-genesis", label: "Sega Genesis" },
        { value: "super-nintendo", label: "Super Nintendo" }
    ];

    // Mock IGDB search function
    const searchIGDB = async () => {
        const mockResults = [
            {
                id: 1,
                title: "Sonic the Hedgehog",
                platform: "Sega Genesis",
                publisher: "Sega",
                year: 1991,
                genres: ["Platformer", "Action"],
                coverImage: "🎮",
                synopsis: "Sonic the Hedgehog is a platform game developed by Sonic Team and published by Sega for the Sega Genesis console. The game follows Sonic, a blue hedgehog who can run at supersonic speeds, as he attempts to defeat the evil Dr. Robotnik, who has imprisoned animals in robots and stolen the Chaos Emeralds. The gameplay involves collecting rings, avoiding obstacles, and running through various levels at high speed.",
                screenshots: [
                    { id: 1, url: "🎮", title: "Sonic running through Green Hill Zone" },
                    { id: 2, url: "🎮", title: "Boss battle with Dr. Robotnik" },
                    { id: 3, url: "🎮", title: "Collecting rings in Marble Zone" },
                    { id: 4, url: "🎮", title: "Special Stage with Chaos Emerald" }
                ]
            },
            {
                id: 2,
                title: "Sonic the Hedgehog 2",
                platform: "Sega Genesis",
                publisher: "Sega", 
                year: 1992,
                genres: ["Platformer", "Action"],
                coverImage: "🎮",
                synopsis: "Sonic the Hedgehog 2 is the second installment in the Sonic series. The game introduces Tails as Sonic's sidekick and features improved graphics, new power-ups, and the iconic spin dash move. Players race through diverse environments while collecting rings and battling Dr. Robotnik's mechanical creations.",
                screenshots: [
                    { id: 1, url: "🎮", title: "Sonic and Tails in Emerald Hill Zone" },
                    { id: 2, url: "🎮", title: "Casino Night Zone gameplay" },
                    { id: 3, url: "🎮", title: "Sky Chase Zone flying sequence" },
                    { id: 4, url: "🎮", title: "Final boss battle" }
                ]
            },
            {
                id: 3,
                title: "Sonic the Hedgehog 3",
                platform: "Sega Genesis",
                publisher: "Sega",
                year: 1994,
                genres: ["Platformer", "Action"],
                coverImage: "🎮",
                synopsis: "Sonic the Hedgehog 3 continues the series with enhanced graphics and introduces Knuckles the Echidna. The game features larger levels, new elemental shields, and a compelling storyline involving Angel Island and the Master Emerald.",
                screenshots: [
                    { id: 1, url: "🎮", title: "Angel Island Zone introduction" },
                    { id: 2, url: "🎮", title: "Hydrocity Zone underwater action" },
                    { id: 3, url: "🎮", title: "Carnival Night Zone barrel challenge" },
                    { id: 4, url: "🎮", title: "Launch Base Zone finale" }
                ]
            },
            {
                id: 4,
                title: "Sonic & Knuckles",
                platform: "Sega Genesis",
                publisher: "Sega",
                year: 1994,
                genres: ["Platformer", "Action"],
                coverImage: "🎮",
                synopsis: "Sonic & Knuckles serves as the conclusion to Sonic 3's story and introduces Knuckles as a playable character with unique gliding and climbing abilities. The innovative lock-on technology allows connection with previous Sonic games for enhanced experiences.",
                screenshots: [
                    { id: 1, url: "🎮", title: "Mushroom Hill Zone autumn scenery" },
                    { id: 2, url: "🎮", title: "Flying Battery Zone mechanical mayhem" },
                    { id: 3, url: "🎮", title: "Sandopolis Zone pyramid exploration" },
                    { id: 4, url: "🎮", title: "Death Egg Zone final confrontation" }
                ]
            },
            {
                id: 5,
                title: "Sonic CD",
                platform: "Sega Genesis",
                publisher: "Sega",
                year: 1993,
                genres: ["Platformer", "Action"],
                coverImage: "🎮",
                synopsis: "Sonic CD introduces time travel mechanics, allowing players to visit past and future versions of each level. The game features Amy Rose and Metal Sonic, along with stunning animated cutscenes and an acclaimed soundtrack.",
                screenshots: [
                    { id: 1, url: "🎮", title: "Collision Chaos present timeline" },
                    { id: 2, url: "🎮", title: "Palmtree Panic good future" },
                    { id: 3, url: "🎮", title: "Metal Sonic race sequence" },
                    { id: 4, url: "🎮", title: "Metallic Madness final zone" }
                ]
            },
            {
                id: 6,
                title: "Sonic Spinball",
                platform: "Sega Genesis",
                publisher: "Sega",
                year: 1993,
                genres: ["Pinball", "Action"],
                coverImage: "🎮",
                synopsis: "Sonic Spinball combines traditional Sonic gameplay with pinball mechanics. Players guide Sonic through pinball-inspired levels, using bumpers, flippers, and ramps while collecting Chaos Emeralds and freeing captured animals.",
                screenshots: [
                    { id: 1, url: "🎮", title: "Toxic Caves pinball action" },
                    { id: 2, url: "🎮", title: "Lava Powerhouse mechanical chaos" },
                    { id: 3, url: "🎮", title: "The Machine fortress infiltration" },
                    { id: 4, url: "🎮", title: "Showdown with Dr. Robotnik" }
                ]
            }
        ];

        return new Promise<any[]>((resolve) => {
            setTimeout(() => {
                resolve(mockResults);
            }, 1500);
        });
    };

    // Auto-search when both fields are filled
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (gameTitle.trim() && platform) {
                performSearch();
            } else {
                setSearchResults([]);
                setHasSearched(false);
                setSelectedGame(null);
            }
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [gameTitle, platform]);

    const performSearch = async () => {
        setIsSearching(true);
        setHasSearched(false);
        setSelectedGame(null);
        
        try {
            const results = await searchIGDB(gameTitle, platform);
            setSearchResults(results);
            setHasSearched(true);
        } catch (error) {
            console.error('Search failed:', error);
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsSearching(false);
        }
    };

    const handleGameSelect = (game: any) => {
        setSelectedGame(game);
    };

    const canContinue = currentStep === 'search' 
        ? (selectedGame !== null && gameTitle.trim() && platform)
        : selectedGame !== null;

    const handleContinue = () => {
        if (canContinue) {
            setCurrentStep('configure');
        }
    };

    const handleContinueWithoutLinking = () => {
        // Use the current form data to create a manual game entry
        const manualGame = {
            id: 'manual',
            title: gameTitle,
            platform: getPlatformLabel(platform),
            year: new Date().getFullYear(),
            genres: [],
            coverImage: "🎮"
        };
        setSelectedGame(manualGame);
        setCurrentStep('configure');
    };

    const handleBackToSearch = () => {
        setCurrentStep('search');
        setSelectedGame(null); // Clear selection when going back to search
    };

    const handleSaveGame = () => {
        console.log('Saving game:', selectedGame);
        // TODO: Save game to collection
        navigate('/collection');
    };

    const getPlatformLabel = (value: string) => {
        const platform = platforms.find(p => p.value === value);
        return platform ? platform.label : value;
    };

    const breadcrumbItems = [
        { label: "My Collection", path: "/collection" },
        { label: "Add New Game", path: "" }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Breadcrumb Navigation */}
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-1">Add New Game</h1>
                <p className="text-gray-400">
                    {currentStep === 'search' ? 'Search IGDB for game information' : 'Configure game details'}
                </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
                <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: currentStep === 'search' ? '25%' : '75%' }}
                    ></div>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-8">
                {currentStep === 'search' ? (
                    /* Search Step */
                    <div>
                        <div className="mb-8">
                            <h2 className="text-xl font-semibold text-white mb-6">Search Game Database</h2>
                        
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                {/* Game Title Input */}
                                <div>
                                    <label htmlFor="gameTitle" className="block text-sm font-medium text-gray-300 mb-2">
                                        Game Title <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        id="gameTitle"
                                        type="text"
                                        placeholder="Enter game title..."
                                        value={gameTitle}
                                        onChange={(e) => setGameTitle(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg
                                                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                                   focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                                        aria-required="true"
                                    />
                                </div>

                                {/* Platform Dropdown */}
                                <div>
                                    <label htmlFor="platform" className="block text-sm font-medium text-gray-300 mb-2">
                                        Platform <span className="text-red-400">*</span>
                                    </label>
                                    <select
                                        id="platform"
                                        value={platform}
                                        onChange={(e) => setPlatform(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg
                                                   text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 
                                                   focus:border-cyan-500 transition-colors cursor-pointer"
                                        aria-required="true"
                                    >
                                        {platforms.map((p) => (
                                            <option key={p.value} value={p.value} disabled={p.value === ""}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Helper Text */}
                            <p className="text-gray-400 text-sm mb-8">
                                Search will begin automatically when both title and platform are provided
                            </p>
                        </div>

                {/* Search Results Section */}
                {(isSearching || hasSearched) && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-white">Search Results</h3>
                            {hasSearched && !isSearching && (
                                <span className="text-gray-400 text-sm">
                                    {searchResults.length} results found
                                </span>
                            )}
                        </div>

                        {/* Loading State */}
                        {isSearching && (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                                    <p className="text-gray-400">Searching IGDB...</p>
                                </div>
                            </div>
                        )}

                        {/* Search Results */}
                        {!isSearching && hasSearched && (
                            <div className="space-y-3">
                                {searchResults.map((game) => (
                                    <div
                                        key={game.id}
                                        onClick={() => handleGameSelect(game)}
                                        className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                                            selectedGame?.id === game.id
                                                ? 'border-cyan-500 bg-cyan-500/10'
                                                : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500'
                                        }`}
                                    >
                                        {/* Game Cover */}
                                        <div className="w-16 h-16 bg-slate-600 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                            {game.coverImage}
                                        </div>

                                        {/* Game Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-medium mb-1">{game.title}</h4>
                                            <p className="text-gray-400 text-sm mb-2">
                                                {game.platform} • {game.year}
                                            </p>
                                            <div className="flex gap-2">
                                                {game.genres.map((genre: string) => (
                                                    <span
                                                        key={genre}
                                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                                            genre === "Platformer" 
                                                                ? "bg-blue-600 text-white" 
                                                                : "bg-green-600 text-white"
                                                        }`}
                                                    >
                                                        {genre}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selection Indicator */}
                                        {selectedGame?.id === game.id && (
                                            <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                        {/* Bottom Section */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                            {/* Continue without linking */}
                            <button
                                onClick={handleContinueWithoutLinking}
                                disabled={!gameTitle.trim() || !platform}
                                className={`text-sm transition-colors ${
                                    gameTitle.trim() && platform
                                        ? 'text-gray-400 hover:text-white cursor-pointer'
                                        : 'text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                Continue without linking
                            </button>

                            {/* Continue Button */}
                            <button
                                onClick={handleContinue}
                                disabled={!canContinue}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                    canContinue
                                        ? 'bg-cyan-500 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800'
                                        : 'bg-slate-600 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Continue
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Configure Step */
                    <div>
                        {/* Game Info Header */}
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-20 h-20 bg-slate-600 rounded-lg flex items-center justify-center text-3xl flex-shrink-0 border border-slate-500">
                                {selectedGame?.coverImage}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedGame?.title}</h2>
                                <p className="text-gray-400 mb-3">
                                    {selectedGame?.platform} • {selectedGame?.publisher} • {selectedGame?.year}
                                </p>
                                {selectedGame?.genres && selectedGame.genres.length > 0 && (
                                    <div className="flex gap-2">
                                        {selectedGame.genres.map((genre: string) => (
                                            <span
                                                key={genre}
                                                className={`px-2 py-1 rounded text-xs font-medium ${
                                                    genre === "Platformer" 
                                                        ? "bg-blue-600 text-white" 
                                                        : "bg-green-600 text-white"
                                                }`}
                                            >
                                                {genre}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detail Tab */}
                        <div className="mb-8">
                            <div className="border-b border-slate-600">
                                <div className="flex">
                                    <button className="px-4 py-3 text-cyan-400 border-b-2 border-cyan-400 font-medium">
                                        Detail
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Synopsis Section */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Synopsis</h3>
                            {selectedGame?.synopsis ? (
                                <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-6">
                                    <p className="text-gray-300 leading-relaxed">{selectedGame.synopsis}</p>
                                </div>
                            ) : (
                                <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-8 text-center">
                                    <FileText className="mx-auto text-gray-500 mb-3" size={48} />
                                    <p className="text-gray-400 mb-1">No synopsis available</p>
                                    <p className="text-gray-500 text-sm">Add game details manually or link with IGDB</p>
                                </div>
                            )}
                        </div>

                        {/* Screenshots Section */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Screenshots</h3>
                                <button className="flex items-center gap-2 px-3 py-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors">
                                    <Plus size={16} />
                                    Add Screenshot
                                </button>
                            </div>
                            {selectedGame?.screenshots && selectedGame.screenshots.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {selectedGame.screenshots.map((screenshot: any) => (
                                        <div key={screenshot.id} className="bg-slate-600 rounded-lg aspect-video flex items-center justify-center text-4xl border border-slate-500 hover:bg-slate-500 transition-colors cursor-pointer">
                                            {screenshot.url}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-slate-700/50 rounded-lg border border-slate-600 p-8 text-center">
                                    <Image className="mx-auto text-gray-500 mb-3" size={48} />
                                    <p className="text-gray-400 mb-1">No screenshots available</p>
                                    <p className="text-gray-500 text-sm">Upload screenshots to showcase the game</p>
                                </div>
                            )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-slate-600">
                            <button
                                onClick={handleBackToSearch}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={16} />
                                Back to Search
                            </button>

                            <button
                                onClick={handleSaveGame}
                                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors font-medium"
                            >
                                <Save size={16} />
                                Save Game
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};