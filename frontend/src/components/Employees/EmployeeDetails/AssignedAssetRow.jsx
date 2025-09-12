import React from 'react';
import { Laptop, Smartphone, Monitor, Printer, Server } from 'lucide-react';

const typeIcons = {
  Laptop: Laptop,
  Phone: Smartphone,
  Mobile: Smartphone,
  Monitor: Monitor,
  Printer: Printer,
  Desktop: Server,
};

const statusColors = {
  Active: 'text-green-700 bg-green-100',
  Inactive: 'text-gray-700 bg-gray-100',
  Maintenance: 'text-yellow-700 bg-yellow-100',
}

const AssignedAssetRow = ({ asset }) => {
  const {
    name = 'Unknown Asset',
    model = 'Unknown Model',
    type = 'Unknown',
    serial_number = 'N/A',
    status = 'inactive',
    assignedEmployee = null,
  } = asset;

  const Icon = typeIcons[type] || Laptop;

  return (
    <tr className="border-t text-sm text-gray-800 hover:bg-gray-50">
      <td className='px-4 py-3 flex items-center gap-2'>
        <Icon size={16} className='text-gray-500' />
        {name}
      </td>
      <td className="px-4 py-3">{type}</td>
      <td className="px-4 py-3">{serial_number}</td>
      <td className="px-4 py-3">
        <span 
          className={`px-2 py-1 text-xs font-medium rounded ${
            statusColors[status] || 'text-gray-700 bg-gray-100'}`}>
          {status}
        </span>
      </td>
      <td className="px-4 py-3">
        {assignedEmployee ? `${assignedEmployee.first_name} ${assignedEmployee.last_name}` : '—'}
      </td>
      <td className='px-4 py-3 flex gap-4 text-sm'>
        <button className='text-blue-600 hover:underline'>View</button>
        <button className='text-red-600 hover:underline'>Return</button>
      </td>
    </tr>
  );
};

export default AssignedAssetRow;
