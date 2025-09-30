import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHardware, setCurrentPage } from '../../store/slices/hardwareSlice';
import AssetRow from './AssetRow';
import Pagination from './Pagination';

const AssetTable = ({ filters, onEdit, onView }) => {
    const dispatch = useDispatch();
    const { hardware, loading, error, pagination } = useSelector(state => state.hardware);
    const [currentPage, setCurrentPageLocal] = useState(1);

    // Fetch hardware data when component mounts or filters change
    useEffect(() => {
        const fetchData = async () => {
            try {
                await dispatch(fetchHardware({
                    page: currentPage,
                    limit: 10,
                    ...filters
                }));
            } catch (error) {
                console.error('Failed to fetch hardware:', error);
            }
        };
        
        fetchData();
    }, [dispatch, currentPage, filters]);

    const handlePageChange = (newPage) => {
        setCurrentPageLocal(newPage);
        dispatch(setCurrentPage(newPage));
    };
    
    if (loading) {
        return (
            <div className='bg-white shadow rounded-lg p-4'>
                <div className='flex items-center justify-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    <span className='ml-2 text-gray-600'>Loading assets...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='bg-white shadow rounded-lg p-4'>
                <div className='text-center py-8'>
                    <div className='text-red-600 mb-2'>Error loading assets</div>
                    <div className='text-gray-500 text-sm'>{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white shadow rounded-lg p-4'>
            <div className='overflow-x-auto'>
                <table className='min-w-full text-sm text-left'>
                    <thead className='bg-gray-100 text-gray-700 uppercase text-xs'>
                        <tr>
                            <th className='px-4 py-2'>Asset Type</th>
                            <th className='px-4 py-2'>Model</th>
                            <th className='px-4 py-2'>Status</th>
                            <th className='px-4 py-2'>Assigned To</th>
                            <th className='px-4 py-2'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {hardware.length === 0 ? (
                        <tr>
                          <td colSpan="5" className='text-center py-4 text-gray-500'>
                            No assets found. Add some hardware assets to get started.
                          </td>
                        </tr>
                        ) : (
                          hardware.map((asset) => (
                            <AssetRow
                                key={asset.id}
                                asset={asset}
                                onEdit={onEdit}
                                onView={onView}
                            />
                      ))
                    )}
                    </tbody>
                </table>
            </div>

            {pagination.totalPages > 1 && (
                <div className='mt-4'>
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange} />
                </div>
            )}
        </div>
    )
};

export default AssetTable;
