import React from 'react';

const WelcomeBanner = ({ userName }) => {
    return (
        <div>
            <h1 className='text-2xl font-bold text-gray-900'>
                Dashboard
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
                Welcome back, {userName || 'User'}! Here's what's happening with your organization today.
            </p>
        </div>
    )
};

export default WelcomeBanner;
