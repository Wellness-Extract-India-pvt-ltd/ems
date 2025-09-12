import { useState } from 'react';
import AssetTable from '../components/Assets/AssetTable';
import AssetFilters from '../components/Assets/AssetFilters';
import AssetForm from '../components/Assets/AssetForm';
import { Plus } from 'lucide-react';

const AssetPage = () => {
    const [filters, setFilters] = useState({
        type: '',
        status: ''
    });

    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

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

    return (
        <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-900'>Hardware Assets</h1>
                    <p className='text-gray-600'>Manage and track hardware inventory</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={16} />
                    <span>Add Asset</span>
                </button>
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

            {showAddForm && (
                <AssetForm
                    asset={selectedAsset}
                    onClose={handleFormClose}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    )
};

export default AssetPage;