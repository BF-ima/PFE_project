import React from "react";
import { X, Info, AlertCircle, Users, FolderX, Loader2 } from "lucide-react";

const MODE_INFO = {
  average: {
    label: "By Academic Average",
    description: "Teams are ranked by their academic average (highest first). In case of a tie, submission date is used as a tiebreaker.",
    steps: [
      "Teams ranked by academic average (highest first)",
      "Ties broken by earliest submission date",
      "Each team matched to their highest available preference",
      "Project capacity limits enforced",
    ],
  },
  date: {
    label: "By Submission Date",
    description: "Teams are ranked by when they submitted their wishes (earliest first). In case of a tie, academic average is used as a tiebreaker.",
    steps: [
      "Teams ranked by earliest submission date (first come, first served)",
      "Ties broken by highest academic average",
      "Each team matched to their highest available preference",
      "Project capacity limits enforced",
    ],
  },
  average_date: {
    label: "Average + Date Combined",
    description: "Teams are ranked by academic average first, then by submission date for equal averages.",
    steps: [
      "Primary ranking: academic average (highest first)",
      "Secondary ranking: earliest submission date",
      "Each team matched to their highest available preference",
      "Project capacity limits enforced",
    ],
  },
};

const RunAllocationModal = ({
  isOpen,
  onClose,
  onConfirm,
  confirming,
  teamsCount,
  projectsCount,
  unassignedCount,
  previewAssignments,
  mode,
}) => {
  if (!isOpen) return null;

  const modeInfo = MODE_INFO[mode] || MODE_INFO.average;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Info size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Run Automatic Allocation</h3>
              <p className="text-white/70 text-xs mt-0.5">{modeInfo.label}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={confirming}
            className="text-white hover:text-gray-200 transition-colors disabled:opacity-50">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-[#1e3a5f]">{teamsCount}</p>
              <p className="text-xs text-blue-600 mt-0.5">Teams to assign</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-700">{projectsCount}</p>
              <p className="text-xs text-green-600 mt-0.5">Available projects</p>
            </div>
            <div className={`border rounded-lg p-3 text-center ${
              unassignedCount > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'
            }`}>
              <p className={`text-2xl font-bold ${unassignedCount > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {unassignedCount}
              </p>
              <p className={`text-xs mt-0.5 ${unassignedCount > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                Will be unassigned
              </p>
            </div>
          </div>

          {/* Mode description */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm mb-1">
                  Mode: {modeInfo.label}
                </h4>
                <p className="text-xs text-blue-700 mb-2">{modeInfo.description}</p>
                <ul className="space-y-1">
                  {modeInfo.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-blue-800">
                      <span className="text-blue-500 font-bold shrink-0">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Preview assignments */}
          {previewAssignments?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Preview — first {Math.min(previewAssignments.length, 5)} assignments:
              </p>
              <div className="space-y-2">
                {previewAssignments.slice(0, 5).map((a, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
                    <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white text-xs flex items-center justify-center shrink-0 font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{a.leader_name}</p>
                      <p className="text-xs text-gray-500 truncate">→ {a.project_title}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                      a.priority_obtained === 1
                        ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                        : a.priority_obtained === 2
                        ? 'bg-gray-100 text-gray-600 border-gray-300'
                        : 'bg-orange-100 text-orange-700 border-orange-300'
                    }`}>
                      Choice #{a.priority_obtained}
                    </span>
                  </div>
                ))}
                {previewAssignments.length > 5 && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    + {previewAssignments.length - 5} more assignments...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Unassigned warning */}
          {unassignedCount > 0 && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <FolderX size={16} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-xs text-red-700">
                <span className="font-semibold">{unassignedCount} team{unassignedCount > 1 ? 's' : ''}</span> could
                not be matched to any project. You can assign them manually after running the allocation.
              </p>
            </div>
          )}

          {/* Generic warning */}
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <AlertCircle size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <p>
              This will overwrite any previous automatic allocation results.
              Direct assignments (external supervisor projects) will not be affected.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} disabled={confirming}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={confirming}
            className="px-6 py-2.5 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
            {confirming && <Loader2 size={15} className="animate-spin" />}
            {confirming ? "Running…" : "Confirm & Run"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RunAllocationModal;