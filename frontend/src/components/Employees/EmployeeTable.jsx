import React from 'react';
import EmployeeRow from './EmployeeRow';

const EmployeeTable = ({
    employees,
    selectedEmployeeIds,
    onSelectEmployee,
    onEdit,
    onDelete,
    onView
}) => {
    const isAllSelected = employees.length > 0 && selectedEmployeeIds.length === employees.length;

    const handleSelectAll = () => {
        const allIds = employees.map(emp => emp.id);
        onSelectEmployee(isAllSelected ? [] : allIds);
    };

    const handleSelectOne = (id) => {
        if (selectedEmployeeIds.includes(id)) {
            onSelectEmployee(selectedEmployeeIds.filter(empId => empId !== id));
        } else {
            onSelectEmployee([...selectedEmployeeIds, id]);
        }
    };

    return (
        <div className='overflow-x-auto bg-white rounded-lg shadow'>
            <table className='min-w-full text-sm text-left table-fixed' style={{ tableLayout: 'fixed' }}>
                <thead className='bg-gray-100 text-gray-600 font-medium'>
                    <tr>
                        <th className='px-4 py-3 w-12'>
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                className='form-checkbox h-4 w-4 text-blue-600'
                                aria-label="Select all employees"
                            />
                        </th>
                        <th className='px-4 py-3 w-1/4'>Name</th>
                        <th className='px-4 py-3 w-1/4'>Email</th>
                        <th className='px-4 py-3 w-1/6'>Department</th>
                        <th className='px-4 py-3 w-1/6'>Role</th>
                        <th className='px-4 py-3 w-20'>Status</th>
                        <th className='px-4 py-3 w-24'>Actions</th>
                    </tr>
                </thead>

                <tbody className='divide-y divide-gray-100'>
                    {employees.length > 0 ? (
                        employees.map(employee => (
                            <EmployeeRow
                                key={employee.id}
                                employee={employee}
                                isSelected={selectedEmployeeIds.includes(employee.id)}
                                onSelect={handleSelectOne}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onView={onView}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="7" className="text-center py-6 text-gray-500">
                                No employees found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className='px-4 py-2 text-sm text-gray-500'>
                Showing {employees.length > 0 ? `1 to ${employees.length}` : '0'} of {employees.length} results
            </div>
        </div>
    );
};

export default EmployeeTable;
