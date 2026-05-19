import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AddNotesModal = ({ isOpen, onClose, onConfirm, teamData }) => {
  const [formData, setFormData] = useState({
    oralPresentation: 0,
    deliverablesQuality: 0,
    demoApplication: 0,
    qaResponses: 0,
    juryObservations: "",
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (teamData?.notes) {
        // Mode modification : pré-remplir
        setFormData({
          oralPresentation: teamData.notes.oralPresentation || 0,
          deliverablesQuality: teamData.notes.deliverablesQuality || 0,
          demoApplication: teamData.notes.demoApplication || 0,
          qaResponses: teamData.notes.qaResponses || 0,
          juryObservations: teamData.juryObservations || "",
        });
      } else {
        // Mode ajout : reset
        setFormData({
          oralPresentation: 0,
          deliverablesQuality: 0,
          demoApplication: 0,
          qaResponses: 0,
          juryObservations: "",
        });
      }
    }
  }, [isOpen, teamData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "juryObservations" ? value : parseInt(value) || 0,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#193962]">
              Grade and defense report entry
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {teamData?.id} • {teamData?.projectTitle || "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Info */}
          <div className="bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Project:</span>{" "}
              {teamData?.projectTitle || "Title of project"}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-semibold">Defense:</span>{" "}
              {teamData?.defenseDate || "dd/mm/yyyy"} at{" "}
              {teamData?.defenseTime || "--:--"}
            </p>
          </div>

          {/* Notes Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Notes :
            </label>
            <div className="space-y-3">
              {/* Oral Presentation */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-40">
                  Oral Presentation
                </span>
                <input
                  type="number"
                  name="oralPresentation"
                  min="0"
                  max="20"
                  value={formData.oralPresentation}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-600 w-8">/20</span>
              </div>

              {/* Deliverables Quality */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-40">
                  Deliverables Quality
                </span>
                <input
                  type="number"
                  name="deliverablesQuality"
                  min="0"
                  max="20"
                  value={formData.deliverablesQuality}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-600 w-8">/20</span>
              </div>

              {/* Demo / Application */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-40">
                  Demo / Application
                </span>
                <input
                  type="number"
                  name="demoApplication"
                  min="0"
                  max="20"
                  value={formData.demoApplication}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-600 w-8">/20</span>
              </div>

              {/* Q&A Responses */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-40">
                  Q&A Responses
                </span>
                <input
                  type="number"
                  name="qaResponses"
                  min="0"
                  max="20"
                  value={formData.qaResponses}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent text-center"
                />
                <span className="text-sm text-gray-600 w-8">/20</span>
              </div>
            </div>
          </div>

          {/* Jury Observations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Jury observations:
            </label>
            <textarea
              name="juryObservations"
              value={formData.juryObservations}
              onChange={handleChange}
              placeholder="Write here jury's observation ..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent resize-none bg-gray-100"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#193962] to-[#2D8FBF] hover:from-[#152f4d] hover:to-[#2575a0] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {teamData?.notes ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNotesModal;
