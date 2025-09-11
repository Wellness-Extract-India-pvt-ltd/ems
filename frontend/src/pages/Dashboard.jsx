import React from "react";
import {useAuth} from '../auth/context/AuthProvider';

import WelcomeBanner from "../components/Dashboard/WelcomeBanner";
import SummaryCards from "../components/Dashboard/SummaryCards";
import RecentActivity from "../components/Dashboard/RecentActivity";

const Dashboard = () => {
    
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    const userName = user?.email?.split('@')[0] || user?.email || 'Guest';
    
    return (
        <div className="space-y-6 px-4 py-6">
            <WelcomeBanner userName={userName} />
            <SummaryCards />
            <RecentActivity />
        </div>
    );
    };

export default Dashboard;