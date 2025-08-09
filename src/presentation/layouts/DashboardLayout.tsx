import React, {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {Header} from "../components/header/Header.tsx";
import {Sidebar} from "../components/navigation/Sidebar.tsx";

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 w-full">
            {/* Full-width Header */}
            <Header onMenuClick={() => setSidebarOpen(true)} />
            
            {/* Content Area with Sidebar */}
            <div className="flex pt-16"> {/* pt-16 accounts for header height */}
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <main className="flex-1 px-6 pt-6 pb-8 overflow-auto">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;