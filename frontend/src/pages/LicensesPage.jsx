import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLicenses } from '../store/slices/licenseSlice';
import LicenseTable from '../components/Licenses/LicenseTable';
import LicenseForm from '../components/Licenses/LicenseForm';
import RoleBasedAccess from '../components/RoleBasedAccess';
import { useAuth } from '../auth/context/AuthProvider';
import { Plus } from 'lucide-react';

const LicensesPage = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { list: licenses, status } = useSelector(state => state.licenses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);

  useEffect(() => {
    dispatch(fetchLicenses());
  }, [dispatch]);

  const handleEdit = (license) => {
    setSelectedLicense(license);
    setShowAddForm(true);
  };

  const handleView = (license) => {
    setSelectedLicense(license);
    // TODO: Navigate to license detail page
    console.log('View license:', license);
  };

  const handleFormClose = () => {
    setShowAddForm(false);
    setSelectedLicense(null);
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setSelectedLicense(null);
    dispatch(fetchLicenses()); // Refresh the list
  };

  if (status.fetch === 'loading') {
    return (
      <div className="p-6">
        <div className="text-center">Loading licenses...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Licenses</h1>
          <p className="text-gray-600">
            {user?.role === 'admin' 
              ? 'Manage software licenses and compliance' 
              : 'View your assigned software licenses'
            }
          </p>
        </div>
        <RoleBasedAccess allowedRoles={['admin']}>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            <span>Add License</span>
          </button>
        </RoleBasedAccess>
      </div>

      <div className="bg-white rounded-lg shadow">
        <LicenseTable 
          licenses={licenses}
          onEdit={handleEdit}
          onView={handleView}
        />
      </div>

      <RoleBasedAccess allowedRoles={['admin']}>
        {showAddForm && (
          <LicenseForm
            license={selectedLicense}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
          />
        )}
      </RoleBasedAccess>
    </div>
  );
};

export default LicensesPage;
