import {Home, Monitor, Settings, X, Gamepad2} from "lucide-react";
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
                    onClick={onClose}
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    aria-label="Close navigation menu"
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`
                    fixed top-0 left-0 h-screen w-56 bg-slate-900 border-r border-slate-800 z-30
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0 lg:static lg:h-full lg:z-auto
                `}
                role="navigation"
                aria-label="Main navigation"
            >
                {/* Close button for mobile */}
                <div className="lg:hidden flex justify-end pt-20 pr-4">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded-lg p-2 -m-2"
                        aria-label="Close navigation menu"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-16 lg:mt-24" aria-label="Primary navigation">
                    <ul role="list">
                        {navItems.map((item) => (
                            <li key={item.path} className="mb-1">
                                <NavLink 
                                    to={item.path}
                                    className={({isActive}) => 
                                        `flex items-center gap-3 pl-6 pr-4 py-3 transition-colors duration-200 
                                         focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-inset
                                         ${isActive 
                                            ? 'bg-cyan-500 text-white' 
                                            : 'text-gray-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white'
                                        }`
                                    }
                                    aria-current={item.path === '/' ? 'page' : undefined}
                                >
                                    <span aria-hidden="true">{item.icon}</span>
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