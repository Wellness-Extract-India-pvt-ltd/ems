import AssetStatusBadge from './AssetStatusBadge';

const AssetRow = ({ asset, onEdit, onDelete }) => {
    const { 
<<<<<<< Updated upstream
=======
        id,
>>>>>>> Stashed changes
        type='Unknown', 
        model='-', 
<<<<<<< Updated upstream
        status='Inactive',
        assignedTo='-' 
    } = asset || {};
    
    const assetIcons = {
        Laptop: '💻',
        Desktop: '🖥️',
        Phone: '📱',
        Mobile: '📱',
        Monitor: '🖵',
        Printer: '🖨️'
=======
        serial_number='-',
        status='inactive',
        assignedEmployee=null 
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
            dispatch(deleteHardware(id));
        }
>>>>>>> Stashed changes
    };

    return (
        <tr className='border-b hover:bg-gray-50 transition text-sm'>
            <td className='px-4 py-2 font-medium text-gray-800 flex items-center gap-2'>
                <span>{assetIcons[type] || '📦'}</span>
                {type}
            </td>
<<<<<<< Updated upstream
            <td className='px-4 py-2 text-gray-600'>{model}</td>
            <td className='px-4 py-2'>
                <AssetStatusBadge status={status} />
            </td>
            <td className="px-4 py-2 text-gray-600">{assignedTo}</td>
            <td className='px-4 py-2 flex gap-2'>
                <button
                    className='text-blue-600 hover:underline'
                    onClick={() => onEdit?.(asset)}>Edit</button>
                <button
                    className='text-red-600 hover:underline'
                    onClick={() => onDelete?.(asset)}>Delete</button>
=======
            <td className='px-4 py-2 text-gray-600'>{name}</td>
            <td className='px-4 py-2 text-gray-600'>{brand} {model}</td>
            <td className='px-4 py-2 text-gray-600'>{serial_number}</td>
            <td className='px-4 py-2'>
                <AssetStatusBadge status={status} />
            </td>
            <td className="px-4 py-2 text-gray-600">
                {assignedEmployee ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}` : 'Unassigned'}
            </td>
            <td className='px-4 py-2'>
                <div className="flex space-x-2">
                    <button
                        onClick={() => navigate(`/assets/${id}`)}
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
>>>>>>> Stashed changes
            </td>
        </tr>
    )
};

export default AssetRow;