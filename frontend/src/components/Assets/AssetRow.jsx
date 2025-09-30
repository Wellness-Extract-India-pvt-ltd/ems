import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { deleteHardware } from '../../store/slices/hardwareSlice';
import AssetStatusBadge from './AssetStatusBadge';

const AssetRow = ({ asset, onEdit, onView }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { 
        id,
        name,
        brand,
        model,
        category = 'Other',
        serial_number = '-',
        status = 'Available',
        assigned_to = null,
        assignedEmployee = null
    } = asset || {};
    
    const assetIcons = {
        'Laptop': '💻',
        'Desktop': '🖥️',
        'Server': '🖥️',
        'Network Device': '🌐',
        'Mobile Device': '📱',
        'Phone': '📱',
        'Monitor': '🖵',
        'Printer': '🖨️',
        'Scanner': '📄',
        'Keyboard': '⌨️',
        'Mouse': '🖱️',
        'Tablet': '📱',
        'Other': '📦'
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this hardware asset?')) {
            dispatch(deleteHardware(id));
        }
    };

    return (
        <tr className='border-b hover:bg-gray-50 transition text-sm'>
            <td className='px-4 py-2 font-medium text-gray-800 flex items-center gap-2'>
                <span>{assetIcons[category] || '📦'}</span>
                {category}
            </td>
            <td className='px-4 py-2 text-gray-600'>{model || name}</td>
            <td className='px-4 py-2'>
                <AssetStatusBadge status={status} />
            </td>
            <td className="px-4 py-2 text-gray-600">
                {assignedEmployee ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}` : 'Unassigned'}
            </td>
            <td className='px-4 py-2'>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onView && onView(asset)}
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
    );
};

export default AssetRow;