import {Gamepad2, Home, Monitor, Plus, Settings, X} from "lucide-react";
import React from "react";
import {NavLink} from "react-router-dom";

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    path: string;
}

export const Sidebar: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({isOpen, onClose}) => {
    const navItems: NavItem[] = [
        {id: 'dashboard', label: 'Dashboard', icon: <Home size={20}/>, path: '/'},
        {id: 'collection', label: 'My Collection', icon: <Gamepad2 size={20}/>, path: '/collection'},
        {id: 'consoles', label: 'Console Tracker', icon: <Monitor size={20}/>, path: '/consoles'},
        {id: 'add', label: 'Add Game', icon: <Plus size={20}/>, path: '/add-game'},
        {id: 'settings', label: 'Settings', icon: <Settings size={20}/>, path: '/settings'},
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <button
                    onClick={onClose}>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    />
                </button>
            )}

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 border-r border-slate-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
                {/* Logo Section */}
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                            <Gamepad2 className="text-white" size={24}/>
                        </div>
                        <span className="text-xl font-bold text-white">Gametrove</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-gray-400 hover:text-white"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-6">
                    <ul>
                        {navItems.map((item) => (
                            <li key={item.path} className="mb-1 px-2">
                                <NavLink 
                                    to={item.path}
                                    className={({isActive}) => 
                                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                                            isActive 
                                                ? 'bg-cyan-500 text-white' 
                                                : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                                        }`
                                    }
                                >
                                    {item.icon}
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
        </>
    );
};