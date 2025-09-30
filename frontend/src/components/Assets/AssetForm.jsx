import { useState, useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createHardware, updateHardware } from '../../store/slices/assetSlice';
import { ASSET_TYPES, STATUS_OPTIONS } from '../../constants/assetOptions';

const AssetForm = ({ initialData = null, onCancel }) => {
    const dispatch = useDispatch();

    const [type, setType] = useState('');
    const [model, setModel] = useState('');
    const [status, setStatus] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    useEffect(() => {
        if (initialData) {
            setType(initialData.type || '');
            setModel(initialData.model || '');
            setStatus(initialData.status || '');
            setAssignedTo(initialData.assignedTo || '');
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!type || !model || !status) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const payload = { type, model, status, assignedTo };
        
        if (initialData) {
            dispatch(updateHardware({ id: initialData.id, hardwareData: payload }));
            toast.success('Asset updated successfully.');
        } else {
            dispatch(createHardware(payload));
            toast.success('Asset added successfully.');
        }

        onCancel();
        
    };

    return (
        <form
            onSubmit={handleSubmit}
            className='space-y-4'>
                <div>
                    <label htmlFor="type" className='block text-sm font-medium mb-1'>Asset Type</label>
                    <select
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                        required
                        >
                        <option value=''>Select Type</option>
                        {ASSET_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                        </select>
                </div>

                <div>
                    <label htmlFor="model" className='block text-sm font-medium mb-1'>Model</label>
                    <input
                        id="model"
                        type='text'
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                        required
                    />
                </div>

                <div>
                    <label htmlFor="status" className='block text-sm font-medium mb-1'>Status</label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                        required
                    >
                        <option value=''>Select Status</option>
                       {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                       ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="assignedTo" className='block text-sm font-medium mb-1'>Assigned To</label>
                    <input
                        id="assignedTo"
                        type='text'
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className='w-full border border-gray-300 rounded px-3 py-2 text-sm'
                    />
                </div>

                <div className='flex justify-end gap-2 pt-2'>
                    <button
                        type="button"
                        onClick={onCancel}
                        className='px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300'>
                            Cancel
                        </button>

                    <button
                        type="submit"
                        className='px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700'>
                            {initialData ? 'Update Asset' : 'Add Asset'}
                        </button>
                </div>
            </form>
    );

};

export default AssetForm;
