import { useState } from 'react';
import AssetTable from '../components/Assets/AssetTable';
import AssetFilters from '../components/Assets/AssetFilters';
import AddAssetButton from '../components/Assets/AddAssetButton';
import AssetForm from '../components/Assets/AssetForm';
import BulkUploadModal from '../components/Assets/BulkUploadModal';
import RoleBasedAccess from '../components/RoleBasedAccess';
import { useAuth } from '../auth/context/AuthProvider';
import { Plus, Download, Upload } from 'lucide-react';

const AssetPage = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        type: '',
        status: ''
    });

    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [showBulkUpload, setShowBulkUpload] = useState(false);

    const handleFilter = (newFilters) => {
        setFilters(newFilters);
        console.log('Applied Filters:', newFilters);
    };

    const handleAddClick = () => {
        setSelectedAsset(null);
        setShowAddForm(true);
    };

    const handleEdit = (asset) => {
        setSelectedAsset(asset);
        setShowAddForm(true);
    };

    const handleView = (asset) => {
        // TODO: Navigate to asset detail page
        console.log('View asset:', asset);
    };

    const handleFormClose = () => {
        setShowAddForm(false);
        setSelectedAsset(null);
    };

    const handleFormSuccess = () => {
        setShowAddForm(false);
        setSelectedAsset(null);
    };

    const handleDownloadTemplate = () => {
        // TODO: Implement template download
        console.log('Downloading bulk upload template...');
        // This would typically trigger a file download
        alert('Template download functionality will be implemented');
    };

    const handleBulkUpload = () => {
        setShowBulkUpload(true);
    };

    const handleBulkUploadClose = () => {
        setShowBulkUpload(false);
    };

    const handleBulkUploadSuccess = () => {
        setShowBulkUpload(false);
        // TODO: Refresh the asset table
        console.log('Bulk upload completed successfully');
    };

    return (
        <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Hardware Assets</h1>
                    <p className='text-gray-600'>
                        {user?.role === 'admin' 
                            ? 'Manage and track all company hardware inventory' 
                            : 'View your assigned hardware assets'
                        }
                    </p>
                </div>
                <RoleBasedAccess allowedRoles={['admin']}>
                    <div className="flex items-center space-x-3">
                        {/* Download Template Button */}
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
                            title="Download bulk upload template"
                        >
                            <Download size={16} />
                            <span>Download Template</span>
                        </button>

                        {/* Bulk Upload Button */}
                        <button
                            onClick={handleBulkUpload}
                            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            title="Upload multiple assets via CSV/Excel"
                        >
                            <Upload size={16} />
                            <span>Bulk Upload</span>
                        </button>

                        {/* Add Asset Button (Primary) */}
                        <button
                            onClick={handleAddClick}
                            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <Plus size={16} />
                            <span>Add Asset</span>
                        </button>
                    </div>
                </RoleBasedAccess>
            </div>
            
            <div className="mb-4">
                <AssetFilters onFilter={handleFilter}/>
            </div>
            
            <div className="bg-white rounded-lg shadow">
                <AssetTable 
                    filters={filters}
                    onEdit={handleEdit}
                    onView={handleView}
                />
            </div>

            <RoleBasedAccess allowedRoles={['admin']}>
                {showAddForm && (
                    <AssetForm
                        asset={selectedAsset}
                        onClose={handleFormClose}
                        onSuccess={handleFormSuccess}
                    />
                )}
                
                {showBulkUpload && (
                    <BulkUploadModal
                        onClose={handleBulkUploadClose}
                        onSuccess={handleBulkUploadSuccess}
                    />
                )}
            </RoleBasedAccess>
        </div>
    )
};

export default AssetPage;
