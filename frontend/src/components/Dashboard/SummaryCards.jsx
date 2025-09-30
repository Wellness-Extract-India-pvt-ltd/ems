import React from 'react';
import SummaryCard from './SummaryCard';
import {
    Users,
    Box,
    BadgeAlert,
    LifeBuoy
} from 'lucide-react';

const SummaryCards = ({ stats = {} }) => {
    const cardData = [
        {
            title: 'Total Employees',
            value: stats.employees?.total || 0,
            icon: <Users />,
            label: 'Total',
            color: { bg: 'bg-blue-500' },
            breakdowns: [
                { text: `${stats.employees?.active || 0} Active`, color: 'text-green-600', dot: 'bg-green-500' },
                { text: `${(stats.employees?.total || 0) - (stats.employees?.active || 0)} Inactive`, color: 'text-gray-500', dot: 'bg-gray-400' },
            ],
        },
        {
            title: 'Total Assets',
            value: stats.assets?.total || 0,
            icon: <Box />,
            label: 'Assets',
            color: { bg: 'bg-purple-500' },
            breakdowns: [
                { text: `${stats.assets?.available || 0} Available`, color: 'text-green-600', dot: 'bg-green-500' },
                { text: `${stats.assets?.assigned || 0} Assigned`, color: 'text-blue-600', dot: 'bg-blue-500' },
            ],
        },
        {
            title: 'Expiring Licenses',
            value: stats.licenses?.expiringSoon || 0,
            icon: <BadgeAlert />,
            label: 'Urgent',
            color: { bg: 'bg-yellow-500' },
            breakdowns: [
                { text: `${stats.licenses?.expiringSoon || 0} Next 30 days`, color: 'text-red-500', dot: 'bg-red-500' },
                { text: `${stats.licenses?.expired || 0} Expired`, color: 'text-gray-500', dot: 'bg-gray-400' },
            ],
        },
        {
            title: 'Open Tickets',
            value: stats.tickets?.open || 0,
            icon: <LifeBuoy />,
            label: 'Active',
            color: { bg: 'bg-rose-300' },
            breakdowns: [
                { text: `${stats.tickets?.open || 0} Open`, color: 'text-red-600', dot: 'bg-red-500' },
                { text: `${stats.tickets?.resolved || 0} Resolved`, color: 'text-green-600', dot: 'bg-green-500' },
            ],
        },
    ];
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {cardData.map((card, index) => (
                <SummaryCard
                    key={index}
                    {...card}
                />
            ))}
        </div>
    );
};

export default SummaryCards;
