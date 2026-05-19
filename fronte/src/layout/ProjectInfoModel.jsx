import React from "react";
import { X, Users } from "lucide-react";

export const ProjectInfoModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#f5f6f8] rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-auto shadow-2xl">
        {/* Header avec gradient */}
        <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-xl font-semibold text-center flex-1">
            Project information
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:text-gray-200 hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Information */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-[#18335E] font-medium text-lg mb-4 pb-3 border-b border-gray-200">
                General information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    ID :
                  </label>
                  <p className="text-gray-600">#{project.id}</p>
                </div>
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    Title :
                  </label>
                  <p className="text-gray-600">{project.name}</p>
                </div>
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    Supervisor :
                  </label>
                  <p className="text-gray-600">{project.supervisor}</p>
                </div>
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    Max Students :
                  </label>
                  <p className="text-gray-600">4-6 students</p>
                </div>
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    Date :
                  </label>
                  <p className="text-gray-600">
                    {new Date().toLocaleDateString("en-GB")}
                  </p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-[#18335E] font-medium text-lg mb-4 pb-3 border-b border-gray-200">
                Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 font-medium block mb-2">
                    Description :
                  </label>
                  <p className="text-gray-600 leading-relaxed">
                    {project.summary}
                  </p>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;