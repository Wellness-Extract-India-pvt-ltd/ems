// components/Software/SoftwareTable.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import SoftwareRow from './SoftwareRow';

const SoftwareTable = ({ onEdit, onView }) => {
  const { list: softwareList, status, error } = useSelector(state => state.software);

  // Show loading state
  if (status.fetch === 'loading') {
    return (
      <div className="bg-white rounded-xl shadow p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading software...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (status.fetch === 'failed') {
    return (
      <div className="bg-white rounded-xl shadow p-8">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error loading software</div>
          <div className="text-gray-500 text-sm">{error.fetch}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Users/Departments</th>
            <th className="px-4 py-2">Permissions</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {!softwareList || softwareList.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-8 text-gray-500">
                No software found. Add your first software application.
              </td>
            </tr>
          ) : (
            softwareList.map(software => (
              <SoftwareRow 
                key={software.id} 
                software={software} 
                onEdit={onEdit}
                onView={onView}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SoftwareTable;
