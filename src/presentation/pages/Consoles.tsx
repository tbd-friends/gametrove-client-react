import React from "react";
import { Monitor, Plus, Gamepad2, HardDrive, Trophy } from "lucide-react";

export const Consoles: React.FC = () => {
    const consoles = [
        {
            id: 1,
            name: "Nintendo Switch",
            manufacturer: "Nintendo",
            year: 2017,
            icon: "🎮",
            status: "owned",
            games: 24,
            hardware: 2,
            added: "Mar 2022",
            color: "bg-red-600"
        },
        {
            id: 2,
            name: "PlayStation 5",
            manufacturer: "Sony",
            year: 2020,
            icon: "🎮",
            status: "owned",
            games: 18,
            hardware: 1,
            added: "Nov 2020",
            color: "bg-blue-600"
        },
        {
            id: 3,
            name: "Xbox Series X",
            manufacturer: "Microsoft",
            year: 2020,
            icon: "🎮",
            status: "owned",
            games: 15,
            hardware: 1,
            added: "Dec 2020",
            color: "bg-green-600"
        },
        {
            id: 4,
            name: "Sega Genesis",
            manufacturer: "Sega",
            year: 1988,
            icon: "🎮",
            status: "owned",
            games: 32,
            hardware: 1,
            added: "Jan 2021",
            color: "bg-purple-600"
        },
        {
            id: 5,
            name: "Super Nintendo",
            manufacturer: "Nintendo",
            year: 1990,
            icon: "🎮",
            status: "owned",
            games: 28,
            hardware: 1,
            added: "Feb 2021",
            color: "bg-red-600"
        },
        {
            id: 6,
            name: "Steam Deck",
            manufacturer: "Valve",
            year: 2022,
            icon: "🎮",
            status: "wishlist",
            games: 0,
            hardware: 0,
            added: null,
            color: "bg-orange-600"
        },
        {
            id: 7,
            name: "Game Boy Advance",
            manufacturer: "Nintendo",
            year: 2001,
            icon: "🎮",
            status: "owned",
            games: 12,
            hardware: 1,
            added: "Jun 2022",
            color: "bg-red-600"
        },
        {
            id: 8,
            name: "PlayStation 2",
            manufacturer: "Sony",
            year: 2000,
            icon: "🎮",
            status: "owned",
            games: 45,
            hardware: 1,
            added: "Aug 2021",
            color: "bg-blue-600"
        }
    ];

    const ownedConsoles = consoles.filter(c => c.status === "owned");
    const wishlistConsoles = consoles.filter(c => c.status === "wishlist");
    const totalGames = ownedConsoles.reduce((sum, console) => sum + console.games, 0);
    const totalHardware = ownedConsoles.reduce((sum, console) => sum + console.hardware, 0);
    const mostGamesConsole = ownedConsoles.reduce((prev, current) => 
        (prev.games > current.games) ? prev : current
    );

    const stats = [
        {
            title: "Total Consoles",
            value: `${ownedConsoles.length}`,
            subtitle: `${ownedConsoles.length} Owned, ${wishlistConsoles.length} Wishlist`,
            icon: <Monitor size={24} className="text-cyan-400" />,
        },
        {
            title: "Total Games",
            value: totalGames.toString(),
            subtitle: "Across all consoles",
            icon: <Gamepad2 size={24} className="text-green-400" />,
        },
        {
            title: "Hardware Items",
            value: totalHardware.toString(),
            subtitle: "Physical consoles",
            icon: <HardDrive size={24} className="text-blue-400" />,
        },
        {
            title: mostGamesConsole.name,
            value: "Most Games",
            subtitle: `${mostGamesConsole.games} games`,
            icon: <Trophy size={24} className="text-yellow-400" />,
        }
    ];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Console Tracker</h1>
                    <p className="text-gray-400">Manage and track your gaming console collection</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors">
                    <Plus size={20} />
                    Add Console
                </button>
            </div>

            {/* Console Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {consoles.map((console) => (
                    <div key={console.id} className="bg-slate-800 rounded-lg border border-slate-700 p-6 hover:bg-slate-700/50 transition-colors relative">
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                console.status === "owned" 
                                    ? "bg-green-600 text-white" 
                                    : "bg-yellow-600 text-white"
                            }`}>
                                {console.status === "owned" ? "Owned" : "Wishlist"}
                            </span>
                        </div>

                        {/* Console Icon */}
                        <div className={`w-12 h-12 ${console.color} rounded-lg flex items-center justify-center text-white text-xl mb-4`}>
                            {console.icon}
                        </div>

                        {/* Console Info */}
                        <h3 className="text-white font-semibold text-lg mb-1">{console.name}</h3>
                        <p className="text-gray-400 text-sm mb-4">{console.manufacturer} • {console.year}</p>

                        {/* Stats */}
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Games:</span>
                                <span className="text-green-400 font-semibold">
                                    {console.status === "wishlist" ? "-" : console.games}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Hardware:</span>
                                <span className="text-gray-300 font-semibold">
                                    {console.status === "wishlist" ? "-" : console.hardware}
                                </span>
                            </div>
                        </div>

                        {/* Added Date or Status */}
                        <div className="border-t border-slate-600 pt-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">
                                    {console.status === "wishlist" ? "Status:" : "Added:"}
                                </span>
                                <span className={`text-sm font-medium ${
                                    console.status === "wishlist" 
                                        ? "text-yellow-400" 
                                        : "text-gray-300"
                                }`}>
                                    {console.status === "wishlist" ? "Wanted" : console.added}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800 rounded-lg border border-slate-700 p-6 relative">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                                <p className="text-3xl font-bold text-green-400 mb-1">{stat.value}</p>
                                <p className="text-gray-400 text-xs">{stat.subtitle}</p>
                            </div>
                            <div className="absolute top-4 right-4">
                                {stat.icon}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};