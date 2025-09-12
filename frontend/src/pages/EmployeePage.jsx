import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
    fetchEmployees,
    setEmployees
} from '../store/slices/employeeSlice'

import SearchBar from '../components/Employees/SearchBar'
import EmployeeTable from '../components/Employees/EmployeeTable'
import Pagination from '../components/Employees/Pagination'
import BulkUploadButton from '../components/Employees/BulkUploadButton'
import RoleBasedAccess from '../components/RoleBasedAccess'
import { useAuth } from '../auth/context/AuthProvider'

const EmployeePage = () => {
    const { user } = useAuth()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const employees = useSelector((state) => state.employees.list)
    const loading = useSelector((state) => state.employees.loading)
    const error = useSelector((state) => state.employees.error)

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    
    const itemsPerPage = 6;

    useEffect(() => {
        dispatch(fetchEmployees());
    }, [dispatch]);

    const filteredEmployees = (employees || []).filter((emp) =>
  (emp?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
);


    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    
    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
        setSelectedEmployeeIds([]);
    };

    const handleAddEmployee = () => {
        navigate('/employees/add');
    };

    const handleBulkUpload = (newEmployees) => {
        const updatedEmployees = [...employees, ...newEmployees];
        dispatch(setEmployees(updatedEmployees))
    };

    const handleView = (emp) => {
        navigate(`/employees/${emp.id}`);
    };

    const handleEdit = (emp) => console.log('Edit', emp);
    
    const handleDelete = (emp) => {
        const confirmed = window.confirm(`Are you sure you want to delete ${emp.name}?`);
        if (confirmed) {
            const updatedList = employees.filter((e) => e.id !== emp.id)
            dispatch(setEmployees(updatedList))
        }
    }

    return (
        <div className='p-6'>
            <div className='flex justify-between items-center mb-4'>
            <SearchBar
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                onAddEmployee={handleAddEmployee}
            />

            <RoleBasedAccess allowedRoles={['admin']}>
                <BulkUploadButton onUpload={handleBulkUpload} />
            </RoleBasedAccess>
            </div>

            {loading ? (
                <p>Loading employees...</p>
            ) : error ? (
                <p className='text-red-600'>Error: {error.fetch}</p>
            ) : (
                <>
                    <EmployeeTable
                        employees={paginatedEmployees}
                        selectedEmployeeIds={selectedEmployeeIds}
                        onSelectEmployee={setSelectedEmployeeIds}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                />
            )}
                </>
            )}
        </div>
  )
};

export default EmployeePage;