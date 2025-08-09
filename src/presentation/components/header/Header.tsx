import {Menu, Plus, Search, User} from "lucide-react";
import React, {useState} from "react";

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const [searchValue, setSearchValue] = useState('');

    return (
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Menu button and search */}
                <div className="flex items-center gap-4 flex-1">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="relative max-w-md flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search games or consoles..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg
                       text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500
                       transition-colors duration-200"
                        />
                    </div>
                </div>

                {/* Right side - Add button and profile */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white
                           rounded-lg hover:bg-cyan-600 transition-colors duration-200">
                        <Plus size={20} />
                        <span className="hidden sm:inline">Add Game</span>
                    </button>

                    <button className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center
                           hover:bg-slate-600 transition-colors duration-200">
                        <User className="text-gray-300" size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};
