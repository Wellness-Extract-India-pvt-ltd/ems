// pages/SoftwarePage.jsx
import React, { useState } from 'react';
import SoftwareTable from '../components/Software/SoftwareTable';
import SoftwareForm from '../components/Software/SoftwareForm';

const SoftwarePage = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSoftware, setSelectedSoftware] = useState(null);

  const handleEdit = (software) => {
    setSelectedSoftware(software);
    setShowAddForm(true);
  };

  const handleView = (software) => {
    // TODO: Navigate to software detail page
    console.log('View software:', software);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedSoftware(null);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setSelectedSoftware(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software & Applications</h1>
          <p className="text-gray-600">Manage software inventory and licenses</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <SoftwareTable 
          onEdit={handleEdit}
          onView={handleView}
        />
      </div>

      {showAddForm && (
        <SoftwareForm
          software={selectedSoftware}
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default SoftwarePage;
