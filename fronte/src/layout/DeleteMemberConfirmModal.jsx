import React from 'react';
import { TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const DeleteMemberConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    toast.success('Member removed successfully');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="px-8 pt-8 pb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <TriangleAlert size={28} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Delete member</h2>
          </div>
        </div>
        
        <div className="px-8 pb-6 pt-2">
          <p className="text-gray-600 text-base">
            Are you sure you want to delete this member? This action is irreversible.
          </p>
        </div>
        
        <div className="flex justify-end gap-4 px-8 pb-8">
          <button
            onClick={onClose}
            className="px-8 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-8 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteMemberConfirmModal;