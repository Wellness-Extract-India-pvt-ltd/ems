import React from 'react'
import AddEmployeeForm from '../components/Employees/AddEmployeeForm'

const AddEmployeePage = () => {
  return (
    <div className='p-6'>
        <h2 className='text-2xl font-semibold mb-6'>Add New Employee</h2>
        <AddEmployeeForm />
    </div>
  )
}

export default AddEmployeePage
