import React, { useState } from "react";
import { X } from "lucide-react";

const ReassignModal = ({ isOpen, onClose, team, projects, onAssign }) => {
  const [selectedProject, setSelectedProject] = useState(null);

  if (!isOpen || !team) return null;

  const handleAssign = () => {
    if (selectedProject) {
      console.log("📝 handleAssign appelé");
      console.log("📋 selectedProject:", selectedProject);
      if (selectedProject) {
        console.log("✅ Attribution confirmée:", selectedProject.name);
        onAssign(team.id, selectedProject);
        // Pas besoin de reset ici, c'est géré par le parent
      } else {
        console.log("❌ Aucun projet sélectionné!");
      }
    }
  };

  const handleClose = () => {
    setSelectedProject(null);
    onClose();
  };

  // Vérifier si un projet est dans les préférences de l'équipe
  const isInPreferences = (projectName) => {
    return team.preferences?.some((pref) => pref.projectName === projectName);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-semibold">
            Manual Assignment - {team?.id}
          </h3>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-4">
            Select a project to assign to this team. Projects in their
            preferences are highlighted.
          </p>

          {/* Team Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Team leader</p>
                <p className="text-[#1e3a5f] font-semibold">{team?.leader}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average</p>
                <p className="text-[#1e3a5f] font-semibold">
                  {team?.academicAverage} / 20
                </p>
              </div>
            </div>
          </div>

          {/* Projects List */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Select a project
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {projects?.map((project) => {
                const inPreferences = isInPreferences(project.name); // ✅ Comparer par name
                const isSelected = selectedProject?.name === project.name; // ✅ Comparer par name

                return (
                  <button
                    key={project.id}
                    type="button" // ✅ Important pour éviter le submit du form parent
                    onClick={() => {
                      console.log("🎯 Projet sélectionné:", project.name);
                      console.log("🎯 Projet cliqué:", project.name);
                      console.log("📋 selectedProject avant:", selectedProject);
                      setSelectedProject(project);
                      console.log("✅ selectedProject après:", project);
                    }}
                    className={`w-full p-4 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-blue-100 border-blue-400 ring-2 ring-blue-400"
                        : inPreferences
                          ? "bg-blue-50 border-blue-300 hover:bg-blue-100"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {isSelected && (
                            <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          )}
                          <h5 className="font-semibold text-[#1e3a5f]">
                            {project.name}
                          </h5>
                          {inPreferences && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                              In Preferences
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Max students: {project.maxStudents}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedProject} // ✅ Le bouton s'active quand selectedProject est défini
            className={`px-6 py-2.5 text-white rounded-lg font-medium transition-colors ${
              selectedProject
                ? "bg-gradient-to-r from-[#18335E] to-[#2D8FBF] hover:from-[#152a4d] hover:to-[#2575a0]"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Assign the project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReassignModal;
