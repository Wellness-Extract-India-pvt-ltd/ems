import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';
import { Menu } from 'lucide-react'

const AppLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const isChatPage = location.pathname === '/chat';
    const isDashboardPage = location.pathname === '/dashboard';

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <Header title="MyWellness" className="sticky top-0 z-10 onMenuClick={() => setSidebarOpen(!sidebarOpen)}" />

            <div className="flex flex-1 overflow-hidden">
                <Sidebar 
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                />
                
                <main className={`flex-1 ${isChatPage ? 'p-0 h-full' : isDashboardPage ? 'p-0 h-full' : 'p-6 overflow-y-auto scroll-smooth'}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
