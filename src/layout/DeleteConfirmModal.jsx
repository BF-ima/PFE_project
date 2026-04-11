import React from "react";
import { X } from "lucide-react";

const DeleteConfirmModal = ({ user, userType, onClose, onConfirm }) => {
  if (!user) return null;

  const getTypeLabel = () => {
    switch (userType) {
      case "admin":
        return "Admin";
      case "teacher":
        return "Teacher";
      case "externalSupervisor":
        return "External Supervisor";
      case "student":
        return "Student";
      default:
        return "User";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Delete this {getTypeLabel()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-0.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div>
              <p className="text-yellow-800 font-medium text-sm">Warning:</p>
              <ul className="text-yellow-700 text-sm mt-1">
                <li>• You can not restore this {getTypeLabel()}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Confirmation Text */}
        <p className="text-gray-600 mb-6">
          Are you sure that you want to continue ?
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#FF6B6B] text-white rounded-lg hover:bg-[#ff5252] transition-colors font-medium"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;