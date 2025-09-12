// pages/SoftwarePage.jsx
import React from 'react';
import SoftwareTable from '../components/Software/SoftwareTable';
<<<<<<< Updated upstream

const SoftwarePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Software & Applications</h1>
      <SoftwareTable />
=======
import SoftwareForm from '../components/Software/SoftwareForm';
import RoleBasedAccess from '../components/RoleBasedAccess';
import { useAuth } from '../auth/context/AuthProvider';
import { Plus } from 'lucide-react';

const SoftwarePage = () => {
  const { user } = useAuth();
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

  const handleAddClick = () => {
    setSelectedSoftware(null);
    setShowAddForm(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software & Applications</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Manage software inventory and licenses' 
              : 'View your assigned software applications'
            }
          </p>
        </div>
        <RoleBasedAccess allowedRoles={['admin']}>
          <button
            onClick={handleAddClick}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add Software</span>
          </button>
        </RoleBasedAccess>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <SoftwareTable 
          onEdit={handleEdit}
          onView={handleView}
        />
      </div>

      <RoleBasedAccess allowedRoles={['admin']}>
        {showAddForm && (
          <SoftwareForm
            software={selectedSoftware}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </RoleBasedAccess>
>>>>>>> Stashed changes
    </div>
  );
};

export default SoftwarePage;
