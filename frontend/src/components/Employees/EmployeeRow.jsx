import React from "react";
import { Pencil, Trash2, Eye } from "lucide-react";
import classNames from "classnames";

const statusColors = {
    Active: 'bg-green-100 text-green-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Inactive: 'bg-gray-100 text-gray-500',
};

const EmployeeRow = ({ employee, onEdit, onDelete, onView, isSelected, onSelect }) => {
    const {
        id,
        first_name,
        last_name,
        name,
        email,
        department,
        role,
        status
    } = employee;

    // Create full name from first_name and last_name, or use name if available
    const fullName = name || `${first_name || ''} ${last_name || ''}`.trim() || 'Unknown';

    const formattedStatus = status
        ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
        : 'Unknown';

    return (
        <tr className="hover:bg-gray-50 transition-colors h-12">
            <td className="px-4 py-3 w-12">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(id)}
                    className="form-checkbox h-4 w-4 text-blue-600"
                    aria-label={`Select ${fullName}`}
                />
            </td>
            <td className="px-4 py-3 w-1/4">
                <span className="font-medium text-gray-800 whitespace-nowrap">{fullName}</span>
            </td>
            <td className="px-4 py-3 w-1/4 text-gray-700 truncate">{email}</td>
            <td className="px-4 py-3 w-1/6 text-gray-700">{department}</td>
            <td className="px-4 py-3 w-1/6 text-gray-700">{role}</td>

            <td className="px-4 py-3 w-20">
                <span
                    className={classNames(
                        'text-xs font-medium px-2 py-1 rounded-full',
                        statusColors[status] || 'bg-gray-100 text-gray-500'
                    )}>
                    {formattedStatus}
                </span>
            </td>

            <td className="px-4 py-3 w-24 space-x-3 text-gray-500 flex items-center">
                <button
                    onClick={() => onView(employee)}
                    aria-label={`View ${fullName}`}
                    title="View"
                    className="hover:text-blue-600"
                >
                    <Eye size={16} />
                </button>
                <button
                    onClick={() => onEdit(employee)}
                    aria-label={`Edit ${fullName}`}
                    title="Edit"
                    className="hover:text-yellow-600"
                >
                    <Pencil size={16} />
                </button>
                <button
                    onClick={() => onDelete(employee)}
                    aria-label={`Delete ${fullName}`}
                    title="Delete"
                    className="hover:text-red-600"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
};

export default EmployeeRow;
