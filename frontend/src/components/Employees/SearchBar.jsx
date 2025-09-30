import React from 'react';
import { Plus, Filter } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange, onAddEmployee }) => {
    return (
        <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4'>
            <div className='relative w-full sm:max-w-xs'>
                <input
                    type="text"
                    placeholder='Search employees...'
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className='w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
            </div>

            <div className='flex items-center gap-2'>
                <button className='flex items-center gap-2 text-sm px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100'>
                    <Filter size={16} />
                    Filter
                </button>

                <button
                    onClick={onAddEmployee}
                    className='flex items-center gap-2 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition'>
                    <Plus size={16} />
                    Add Employee
                </button>
            </div>
        </div>
    )
};

export default SearchBar;
