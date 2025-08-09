import {Menu, Plus, Search, User, Gamepad2} from "lucide-react";
import React, {useState} from "react";

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [searchValue, setSearchValue] = useState('');

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
                    <div className="relative w-full max-w-md">
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
                    </div>
                </div>

                {/* Right side - Add button and profile */}
                <div className="flex items-center gap-4">
                    <button 
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white
                           rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900
                           transition-colors duration-200"
                        aria-label="Add new game to collection"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Add Game</span>
                    </button>

                    <button 
                        className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center
                           hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900
                           transition-colors duration-200"
                        aria-label="User account menu"
                    >
                        <User className="text-gray-300" size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
