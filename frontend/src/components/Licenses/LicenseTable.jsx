import React from 'react';
import LicenseRow from './LicenseRow';

const LicenseTable = ({ licenses, onEdit, onView }) => {
  // Ensure licenses is an array
  const licensesList = Array.isArray(licenses) ? licenses : [];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-3">Software Name</th>
            <th className="px-4 py-3">License Key</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Seats</th>
            <th className="px-4 py-3">Purchase Date</th>
            <th className="px-4 py-3">Expiry Date</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {licensesList.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-8 text-gray-500">
                No licenses found. Add your first software license.
              </td>
            </tr>
          ) : (
            licensesList.map(license => (
              <LicenseRow 
                key={license.id} 
                license={license} 
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

export default LicenseTable;
