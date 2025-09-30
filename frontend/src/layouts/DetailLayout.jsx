import { Outlet } from 'react-router-dom';
import Header from '../components/Header/Header';
import React from 'react';

const DetailLayout = () => {
    return (
        <div className="flex flex-col h-screen bg-white">
            <Header showBack={true} title="Employee Details" className='sticky top-0 z-10' />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                <React.Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
                    <Outlet />
                </React.Suspense>
            </main>
        </div>
    );
};

export default DetailLayout;
