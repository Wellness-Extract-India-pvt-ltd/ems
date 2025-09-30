import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react';

const EmployeeInfoCard = ({ employee }) => {
  return (
    <div className='w-full md:w-80 bg-white p-0 border-r border-gray-200'>
  <div className='flex items-center space-x-4 mb-4'>
    <img
      src={employee.photoUrl || '../../assets/img.png'}
      onError={(e) => e.currentTarget.src = '/default-avatar.png'}
      alt={employee.name}
      className='w-16 h-16 rounded-full object-cover'
    />
    <div>
      <h2 className='text-lg font-semibold text-gray-800'>{employee.name}</h2>
      <p className='text-sm text-gray-500'>{employee.title}</p>
      <span className='inline-block mt-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full'>
        {employee.status}
      </span>
    </div>
  </div>

  <div className='mb-6'>
    <h3 className='text-sm font-medium text-gray-500 mb-2'>Contact Information</h3>
    <ul className='space-y-1 text-sm text-gray-700'>
      <li className='flex items-center gap-2'>
        <Mail size={14} className="text-gray-500" /> {employee.email}
      </li>
      <li className='flex items-center gap-2'>
        <Phone size={14} className="text-gray-500" /> {employee.phone}
      </li>
      <li className='flex items-center gap-2'>
        <MapPin size={14} className="text-gray-500" /> {employee.location}
      </li>
    </ul>
  </div>

  <div className='mb-6'>
    <h3 className='text-sm font-medium text-gray-500 mb-2'>Employment Details</h3>
    <ul className='text-sm text-gray-700 space-y-1'>
      <li><strong>Employee ID:</strong> {employee.id}</li>
      <li><strong>Department:</strong> {employee.department}</li>
      <li><strong>Manager:</strong> {employee.manager}</li>
      <li><strong>Start Date:</strong> {new Date(employee.startDate).toLocaleDateString()}</li>
      <li><strong>Employment Type:</strong> {employee.employmentType}</li>
    </ul>
  </div>

  <div>
    <h3 className='text-sm font-medium text-gray-500 mb-2'>Additional Information</h3>
    <ul className='text-sm text-gray-700 space-y-1'>
      <li><strong>Security Clearance:</strong> {employee.securityClearance}</li>
      <li><strong>Last Login:</strong> {employee.lastLogin}</li>
    </ul>
  </div>
</div>
  )
}

export default EmployeeInfoCard
