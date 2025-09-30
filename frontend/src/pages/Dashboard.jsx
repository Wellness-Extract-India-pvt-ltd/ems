import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useAuth} from '../auth/context/AuthProvider';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';

import WelcomeBanner from "../components/Dashboard/WelcomeBanner";
import SummaryCards from "../components/Dashboard/SummaryCards";
import RecentActivity from "../components/Dashboard/RecentActivity";
import TimeTracker from "../components/Dashboard/TimeTracker";
import TeamTimeTracking from "../components/Dashboard/TeamTimeTracking";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user, loading: authLoading } = useAuth();
    const { stats, loading: dashboardLoading, error } = useSelector(state => state.dashboard);

    // Fetch dashboard stats on component mount
    useEffect(() => {
        dispatch(fetchDashboardStats());
    }, [dispatch]);

    if (authLoading || dashboardLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={() => dispatch(fetchDashboardStats())}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const userName = user?.email?.split('@')[0] || user?.email || 'Guest';
    
    return (
        <div className="h-full flex flex-col">
            {/* Header with Time Tracker - No margins */}
            <div className="flex items-start justify-between px-6 py-4 bg-white border-b border-gray-200">
                <div className="flex-1">
                    <WelcomeBanner userName={userName} />
                </div>
                <div className="-my-4 -mr-6">
                    <TimeTracker />
                </div>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-6 px-6 py-6">
                    {/* Stats Cards - Full Width */}
                    <SummaryCards stats={stats} />
                    
                    {/* Recent Activity */}
                    <RecentActivity />
                    
                    {/* Team Time Tracking for Managers/Admins */}
                    {['admin', 'manager'].includes(user?.role) && <TeamTimeTracking />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;