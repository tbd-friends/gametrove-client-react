import {Menu, Plus, Search, User, Gamepad2, Heart, LogIn, LogOut} from "lucide-react";
import React, {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import { useAuthService } from "../../contexts/AuthContext";

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const authService = useAuthService();

    // Mock search results based on the reference design
    const mockSearchResults = [
        {
            id: 1,
            title: "The Legend of Zelda: Breath of the Wild",
            platform: "Nintendo Switch",
            genre: "Adventure",
            inCollection: true,
            favorite: false
        },
        {
            id: 2,
            title: "God of War",
            platform: "PlayStation 5",
            genre: "Action",
            inCollection: true,
            favorite: false
        },
        {
            id: 3,
            title: "Halo Infinite",
            platform: "Xbox Series X",
            genre: "FPS",
            inCollection: true,
            favorite: true
        },
        {
            id: 4,
            title: "Cyberpunk 2077",
            platform: "PC",
            genre: "RPG",
            inCollection: true,
            favorite: false
        }
    ];

    // Debounced search effect
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchValue.trim()) {
                setIsSearching(true);
                setShowDropdown(true);
                // Simulate API call delay
                setTimeout(() => {
                    setSearchResults(mockSearchResults);
                    setIsSearching(false);
                }, 300);
            } else {
                setSearchResults([]);
                setShowDropdown(false);
                setIsSearching(false);
            }
        }, 200);

        return () => clearTimeout(debounceTimer);
    }, [searchValue]);

    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowDropdown(false);
                setSearchValue('');
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Logo and Menu button */}
                <div className="flex items-center gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                            <Gamepad2 className="text-white" size={20}/>
                        </div>
                        <span className="text-lg font-bold text-white hidden sm:inline">Gametrove</span>
                    </div>

                    <button
                        onClick={onMenuClick}
                        className="lg:hidden text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-2 -m-2"
                        aria-label="Open navigation menu"
                    >
                        <Menu size={24} />
                    </button>
                </div>

                {/* Center - Search bar */}
                <div className="flex-1 flex justify-center px-8">
                    <div ref={searchRef} className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search games or consoles..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
                       transition-colors duration-200"
                            aria-label="Search games and consoles"
                        />
                        
                        {/* Search Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                                {isSearching ? (
                                    <div className="p-4 text-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500 mx-auto mb-2"></div>
                                        <p className="text-gray-400 text-sm">Searching...</p>
                                    </div>
                                ) : (
                                    <div className="p-2">
                                        {/* Search Results */}
                                        {searchResults.map((game) => (
                                            <div key={game.id} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                                                <div className="w-8 h-8 bg-cyan-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                                    🎮
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-white font-medium truncate">{game.title}</h4>
                                                        {game.favorite && (
                                                            <Heart className="text-red-500 fill-current" size={14} />
                                                        )}
                                                    </div>
                                                    <p className="text-gray-400 text-xs truncate">
                                                        {game.platform} • {game.genre}
                                                    </p>
                                                </div>
                                                {game.inCollection && (
                                                    <div className="w-6 h-6 bg-cyan-500 rounded flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Add New Game Button */}
                                        <div className="border-t border-slate-600 mt-2 pt-2">
                                            <button
                                                onClick={() => {
                                                    navigate('/add-game');
                                                    setShowDropdown(false);
                                                    setSearchValue('');
                                                }}
                                                className="w-full flex items-center justify-center gap-2 p-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
                                            >
                                                <Plus size={16} />
                                                Add New Game
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right side - Authentication */}
                <div className="flex items-center gap-4">
                    {authService.isLoading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                    ) : authService.isAuthenticated && authService.user ? (
                        <div className="flex items-center gap-3">
                            <span className="text-gray-300 text-sm hidden md:block">
                                {authService.user.name}
                            </span>
                            {authService.user.picture ? (
                                <img 
                                    src={authService.user.picture} 
                                    alt="User avatar"
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                    <User className="text-gray-300" size={16} />
                                </div>
                            )}
                            <button 
                                onClick={() => authService.logout()}
                                className="p-2 rounded-md bg-slate-700 hover:bg-slate-600 
                                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900
                                         transition-colors duration-200"
                                aria-label="Logout"
                                title="Logout"
                            >
                                <LogOut className="text-gray-300" size={16} />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => authService.login()}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 
                                     text-white rounded-md font-medium transition-colors duration-200
                                     focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                        >
                            <LogIn size={16} />
                            <span className="hidden md:inline">Login</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
