import {Home, Monitor, Plus, Settings, X, Gamepad2} from "lucide-react";
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
        fixed top-16 left-0 h-[calc(100vh-4rem)] w-56 bg-slate-900 border-r border-slate-800 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-auto lg:z-auto
      `}>
                {/* Close button for mobile */}
                <div className="lg:hidden flex justify-end p-4">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-4 lg:mt-6">
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