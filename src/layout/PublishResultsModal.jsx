import React from "react";
import { X, Upload } from "lucide-react";

const PublishResultsModal = ({ isOpen, onClose, onPublish, assignedCount, unassignedCount }) => {
  if (!isOpen) return null;

  const handlePublish = () => {
    onPublish();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Upload size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#1e3a5f]">
              Publish Results
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-6">
            You are about to officially publish the allocation results to students and supervisors.
          </p>

          {/* Statistics */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Assigned teams</span>
                <span className="text-green-600 font-semibold text-lg">
                  {assignedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Unassigned teams</span>
                <span className={`font-semibold text-lg ${unassignedCount > 0 ? "text-red-600" : "text-gray-400"}`}>
                  {unassignedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <p className="text-gray-600 text-sm">
            Once published, the results will be visible to all concerned students and teachers.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Upload size={18} />
            Publish
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishResultsModal;