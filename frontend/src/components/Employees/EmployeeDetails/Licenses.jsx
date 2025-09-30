import React from 'react';

const dummyLicenses = [
  {
    id: 1,
    name: 'Microsoft Office 365',
    key: 'XXXX-YYYY-ZZZZ-1234',
    status: 'Active',
    assignedDate: '2024-01-15',
  },
  {
    id: 2,
    name: 'Adobe Photoshop',
    key: 'ABCD-EFGH-IJKL-5678',
    status: 'Expired',
    assignedDate: '2023-08-10',
  },
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getStatusStyle = (status) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-700';
    case 'Expired':
      return 'bg-red-100 text-red-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const Licenses = () => {
  return (
    <div className="bg-white p-6 rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Assigned Licenses</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
          Assign License
        </button>
      </div>

      {dummyLicenses.length === 0 ? (
        <p className="text-sm text-gray-500">No licenses assigned.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 bg-white shadow-sm rounded">
            <thead className="bg-gray-100 text-sm text-gray-700">
              <tr>
                <th className="text-left px-4 py-2">License Name</th>
                <th className="text-left px-4 py-2">Key</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {dummyLicenses.map((license) => (
                <tr key={license.id} className="border-t hover:bg-gray-50 text-sm text-gray-800">
                  <td className="px-4 py-2">{license.name}</td>
                  <td className="px-4 py-2">{license.key}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded font-semibold ${getStatusStyle(
                        license.status
                      )}`}
                    >
                      {license.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{formatDate(license.assignedDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Licenses;
