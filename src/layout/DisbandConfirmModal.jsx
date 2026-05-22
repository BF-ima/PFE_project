import React from 'react';
import { TriangleAlert } from 'lucide-react';

const DisbandConfirmModal = ({ isOpen, onClose, onConfirm, disbanding }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="px-8 pt-8 pb-2">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <TriangleAlert size={28} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f]">Disband the Team</h2>
          </div>
        </div>

        <div className="px-8 pb-6 pt-2">
          <p className="text-gray-600 text-base">
            Are you sure you want to dissolve the team? This action is irreversible.
            All members will be removed and project preferences will be lost.
          </p>
        </div>

        <div className="flex justify-end gap-4 px-8 pb-8">
          <button
            onClick={onClose}
            disabled={disbanding}
            className="px-8 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={disbanding}
            className="px-8 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-70"
          >
            {disbanding ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Disbanding...
              </span>
            ) : "Disband"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisbandConfirmModal;