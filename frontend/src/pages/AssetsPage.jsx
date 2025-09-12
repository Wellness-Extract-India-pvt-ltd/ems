import { useState } from 'react';
import AssetTable from '../components/Assets/AssetTable';
import AssetFilters from '../components/Assets/AssetFilters';
import AddAssetButton from '../components/Assets/AddAssetButton';
import AssetForm from '../components/Assets/AssetForm';
<<<<<<< Updated upstream
=======
import RoleBasedAccess from '../components/RoleBasedAccess';
import { useAuth } from '../auth/context/AuthProvider';
import { Plus } from 'lucide-react';
>>>>>>> Stashed changes

const AssetPage = () => {
    const { user } = useAuth();
    const [filters, setFilters] = useState({
        type: '',
        status: ''
    });

    const [showAddForm, setShowAddForm] = useState(false);

    const handleFilter = (newFilters) => {
        setFilters(newFilters);
        console.log('Applied Filters:', newFilters);
    };

    const handleAddClick = () => {
        setShowAddForm(true);
    };

    const handleFormClose = () => {
        setShowAddForm(false);
    }

    return (
<<<<<<< Updated upstream
        <div className='p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-2xl font-semibold'>Hardware Assets</h2>
                <AddAssetButton onClick={handleAddClick}/>
=======
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
                    <button
                        onClick={handleAddClick}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} />
                        <span>Add Asset</span>
                    </button>
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
>>>>>>> Stashed changes
            </div>
            <AssetFilters onFilter={handleFilter}/>
            <AssetTable filters={filters}/>

<<<<<<< Updated upstream
            {showAddForm && (
                <AssetForm
                    onClose={handleFormClose}
                    onSuccess={handleFormClose}
                    />
            )}
=======
            <RoleBasedAccess allowedRoles={['admin']}>
                {showAddForm && (
                    <AssetForm
                        asset={selectedAsset}
                        onClose={handleFormClose}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </RoleBasedAccess>
>>>>>>> Stashed changes
        </div>
    )
};

export default AssetPage;