import React from 'react'
import { Plus } from 'lucide-react'

const AssignAssetButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition'
      >
        <Plus size={16} />
        Assign Asset
      </button>
  );
};

export default AssignAssetButton
