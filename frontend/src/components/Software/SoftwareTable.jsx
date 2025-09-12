// components/Software/SoftwareTable.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import SoftwareRow from './SoftwareRow';

const SoftwareTable = () => {
  const softwareList = useSelector(state => state.software.softwareList);

  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Users/Departments</th>
            <th className="px-4 py-2">Permissions</th>
            <th className="px-4 py-2">Description</th>
          </tr>
        </thead>
        <tbody>
<<<<<<< Updated upstream
          {softwareList.map(software => (
            <SoftwareRow key={software.id} software={software} />
          ))}
=======
          {softwareList.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-8 text-gray-500">
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
>>>>>>> Stashed changes
        </tbody>
      </table>
    </div>
  );
};

export default SoftwareTable;
