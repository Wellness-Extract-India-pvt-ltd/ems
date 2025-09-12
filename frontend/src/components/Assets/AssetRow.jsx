import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { deleteHardware } from '../../store/slices/assetSlice';
import AssetStatusBadge from './AssetStatusBadge';
import { Edit, Trash2, Eye } from 'lucide-react';

const AssetRow = ({ asset, onEdit, onView }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { 
        _id,
        type='Unknown', 
        name='-',
        brand='-',
        model='-', 
        serialNumber='-',
        status='inactive',
        assignedTo=null 
    } = asset || {};
    
    const assetIcons = {
        laptop: '💻',
        desktop: '🖥️',
        server: '🖥️',
        'network device': '🌐',
        peripheral: '🖨️'
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this hardware asset?')) {
            dispatch(deleteHardware(_id));
        }
    };

    return (
        <tr className='border-b hover:bg-gray-50 transition text-sm'>
            <td className='px-4 py-2 font-medium text-gray-800 flex items-center gap-2'>
                <span>{assetIcons[type] || '📦'}</span>
                {type}
            </td>
            <td className='px-4 py-2 text-gray-600'>{name}</td>
            <td className='px-4 py-2 text-gray-600'>{brand} {model}</td>
            <td className='px-4 py-2 text-gray-600'>{serialNumber}</td>
            <td className='px-4 py-2'>
                <AssetStatusBadge status={status} />
            </td>
            <td className="px-4 py-2 text-gray-600">
                {assignedTo?.name || 'Unassigned'}
            </td>
            <td className='px-4 py-2'>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate(`/assets/${_id}`)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Details"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit && onEdit(asset)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Edit"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={handleDelete}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
};

export default AssetRow;