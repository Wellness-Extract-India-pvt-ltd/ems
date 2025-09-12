// components/Software/SoftwareTable.jsx
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSoftware } from '../../store/slices/softwareSlice';
import SoftwareRow from './SoftwareRow';
import { Plus } from 'lucide-react';

const SoftwareTable = ({ onEdit, onView }) => {
  const dispatch = useDispatch();
  const { list: softwareList, status } = useSelector(state => state.software);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    dispatch(fetchSoftware());
  }, [dispatch]);


  if (status.fetch === 'loading') {
    return (
      <div className="bg-white rounded-xl shadow p-8">
        <div className="text-center">Loading software...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-auto">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Software & Applications</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          <span>Add Software</span>
        </button>
      </div>
      
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Version</th>
            <th className="px-4 py-2">Vendor</th>
            <th className="px-4 py-2">License Type</th>
            <th className="px-4 py-2">Purchase Date</th>
            <th className="px-4 py-2">Expiry Date</th>
            <th className="px-4 py-2">Assigned To</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {softwareList.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-8 text-gray-500">
                No software found. Add your first software application.
              </td>
            </tr>
          ) : (
            softwareList.map(software => (
              <SoftwareRow 
                key={software._id} 
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
