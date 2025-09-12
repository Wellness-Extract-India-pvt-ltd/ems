import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchHardware } from '../../store/slices/assetSlice';
import AssetRow from './AssetRow';
import Pagination from './Pagination';

const AssetTable = ({ filters, onEdit, onView }) => {
    const dispatch = useDispatch();
    const { list: hardwareList, status } = useSelector(state => state.assets);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(fetchHardware());
    }, [dispatch]);

    // Filter assets based on applied filters
    const filteredAssets = hardwareList.filter(asset => {
        if (filters.type && asset.type !== filters.type) return false;
        if (filters.status && asset.status !== filters.status) return false;
        return true;
    });

    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

    if (status.fetch === 'loading') {
        return (
            <div className='bg-white shadow rounded-lg p-8'>
                <div className='text-center'>Loading hardware assets...</div>
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
                            <th className='px-4 py-2'>Name</th>
                            <th className='px-4 py-2'>Brand/Model</th>
                            <th className='px-4 py-2'>Serial Number</th>
                            <th className='px-4 py-2'>Status</th>
                            <th className='px-4 py-2'>Assigned To</th>
                            <th className='px-4 py-2'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      {currentAssets.length === 0 ? (
                        <tr>
                          <td colSpan="7" className='text-center py-4 text-gray-500'>
                            No hardware assets found.
                          </td>
                        </tr>
                        ) : (
                          currentAssets.map((asset) => (
                            <AssetRow
                                key={asset._id}
                                asset={asset}
                                onEdit={onEdit}
                                onView={onView}
                            />
                      ))
                    )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className='mt-4'>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    )
};

export default AssetTable;