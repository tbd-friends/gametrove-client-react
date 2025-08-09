import React, {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {Header} from "../components/header/Header.tsx";
import {Sidebar} from "../components/navigation/Sidebar.tsx";

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="h-screen bg-slate-950 w-full flex flex-col">
            {/* Full-width Header */}
            <Header onMenuClick={() => setSidebarOpen(true)} />
            
            {/* Content Area with Sidebar */}
            <div className="flex flex-1 min-h-0"> {/* Flex-1 with min-h-0 for proper scrolling */}
                {/* Sidebar */}
                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <main className="flex-1 px-6 pt-6 pb-8 overflow-y-auto overflow-x-hidden">
                    <div className="w-full min-h-full mt-19">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;