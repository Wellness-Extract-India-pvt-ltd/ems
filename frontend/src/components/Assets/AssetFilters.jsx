import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../../store/slices/assetFilterSlice';

const AssetFilters = () => {
    const dispatch = useDispatch();
    const { type, status } = useSelector((state) => state.assetFilter);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(setFilters({ type, status }));
    };

    const handleReset = () => {
        dispatch(resetFilters());
    };

    const assetTypes = ['Laptop', 'Desktop', 'Phone', 'Monitor', 'Printer'];
    const statuses = ['Active', 'Inactive', 'Maintenance'];

    return (
        <form
            onSubmit={handleSubmit}
            className='bg-gray-50 p-4 rounded-lg shadow-sm mb-4 flex flex-col md:flex-row gap-4 md:items-end'
            >
                <div className='flex-1'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                        Asset Type
                    </label>
                    <select
                        className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                        value={type}
                        onChange={(e) => dispatch(setFilters({ type: e.target.value, status }))}
                    >
                        <option value=''>All Types</option>
                        {assetTypes.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                        </select>
                </div>

               <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          value={status}
          onChange={(e) => dispatch(setFilters({ type, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

          <div className='flex gap-2'>
            <button
                type='submit'
                className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium'
                >
                Apply Filters
                </button>
                <button
                    type='button'
                    onClick={handleReset}
                    className='bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded text-sm font-medium'>
                        Clear
                    </button>
          </div>
            
        </form>
    );
    }
export default AssetFilters;
