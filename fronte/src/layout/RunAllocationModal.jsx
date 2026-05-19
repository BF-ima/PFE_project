import React from "react";
import { X, Info, AlertCircle } from "lucide-react";

const RunAllocationModal = ({ isOpen, onClose, onConfirm, teamsCount, projectsCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Info size={20} />
            </div>
            <h3 className="text-lg font-semibold">
              Run automatic allocation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">
            You are about to run the algorithm for{" "}
            <span className="font-semibold text-[#1e3a5f]">{teamsCount} teams</span>
            {" "}and{" "}
            <span className="font-semibold text-[#1e3a5f]">{projectsCount} projects</span>.
          </p>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  How Allocation Works:
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Priority by academic average</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Matches preferences in order</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Auto-resolves conflicts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Enforces project limits</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <AlertCircle size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <p>
              Unassigned teams can be managed manually after allocation.
            </p>
          </div>
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
            onClick={onConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors font-medium"
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunAllocationModal;