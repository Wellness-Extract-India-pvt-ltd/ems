import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createLicense, updateLicense } from '../../store/slices/licenseSlice';
import { X } from 'lucide-react';

const LicenseForm = ({ license, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { status } = useSelector(state => state.licenses);
  const [formData, setFormData] = useState({
    softwareName: '',
    licenseKey: '',
    licenseType: 'perpetual',
    totalSeats: '',
    usedSeats: '',
    purchaseDate: '',
    expiryDate: '',
    vendor: '',
    cost: '',
    notes: ''
  });

  useEffect(() => {
    if (license) {
      setFormData({
        softwareName: license.softwareName || '',
        licenseKey: license.licenseKey || '',
        licenseType: license.licenseType || 'perpetual',
        totalSeats: license.totalSeats || '',
        usedSeats: license.usedSeats || '',
        purchaseDate: license.purchaseDate ? license.purchaseDate.split('T')[0] : '',
        expiryDate: license.expiryDate ? license.expiryDate.split('T')[0] : '',
        vendor: license.vendor || '',
        cost: license.cost || '',
        notes: license.notes || ''
      });
    }
  }, [license]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        totalSeats: parseInt(formData.totalSeats) || 0,
        usedSeats: parseInt(formData.usedSeats) || 0,
        cost: parseFloat(formData.cost) || 0
      };

      if (license) {
        await dispatch(updateLicense({ id: license._id, licenseData: submitData }));
      } else {
        await dispatch(createLicense(submitData));
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving license:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isLoading = status.create === 'loading' || status.update === 'loading';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {license ? 'Edit License' : 'Add New License'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="softwareName" className="block text-sm font-medium text-gray-700 mb-1">
                Software Name *
              </label>
              <input
                type="text"
                id="softwareName"
                name="softwareName"
                value={formData.softwareName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Microsoft Office"
              />
            </div>

            <div>
              <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 mb-1">
                License Key
              </label>
              <input
                type="text"
                id="licenseKey"
                name="licenseKey"
                value={formData.licenseKey}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter license key"
              />
            </div>

            <div>
              <label htmlFor="licenseType" className="block text-sm font-medium text-gray-700 mb-1">
                License Type
              </label>
              <select
                id="licenseType"
                name="licenseType"
                value={formData.licenseType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="perpetual">Perpetual</option>
                <option value="subscription">Subscription</option>
                <option value="trial">Trial</option>
              </select>
            </div>

            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <input
                type="text"
                id="vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Microsoft"
              />
            </div>

            <div>
              <label htmlFor="totalSeats" className="block text-sm font-medium text-gray-700 mb-1">
                Total Seats
              </label>
              <input
                type="number"
                id="totalSeats"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="usedSeats" className="block text-sm font-medium text-gray-700 mb-1">
                Used Seats
              </label>
              <input
                type="number"
                id="usedSeats"
                name="usedSeats"
                value={formData.usedSeats}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Additional notes about this license"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Saving...' : (license ? 'Update License' : 'Add License')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LicenseForm;
