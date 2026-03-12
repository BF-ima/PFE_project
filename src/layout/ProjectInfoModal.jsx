// src/layout/ProjectInfoModal.jsx
import React from 'react';
import { X, ArrowLeft } from 'lucide-react';

const ProjectInfoModal = ({ isOpen, onClose, project, getStateColor, getStateText }) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Overlay pour fermer en cliquant à l'extérieur */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      ></div>
      
      {/* Contenu du modal - au premier plan */}
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-auto shadow-2xl overflow-hidden relative z-10">
        {/* Header avec flèche de retour et X */}
        <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-3 relative flex items-center">
          <button
            onClick={onClose}
            className="absolute left-4 text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-full"
            title="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-center flex-1">Project Information</h2>
          <button
            onClick={onClose}
            className="absolute right-4 text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/20 rounded-full"
            title="Fermer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu - deux colonnes */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carte 1: General Information */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <h3 className="text-base font-medium text-gray-800 text-center">General Information</h3>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">ID</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{project.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Title</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{project.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Max Students</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{project.maxStudents}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">State</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStateColor(project.state)}`}>
                      {getStateText(project.state)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Date</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{project.createdOn}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Carte 2: Details */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <h3 className="text-base font-medium text-gray-800 text-center">Details</h3>
              </div>
              <div className="p-5 space-y-5">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Languages & Tools</p>
                  <p className="text-sm text-gray-700 font-medium">{project.technologies}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">Team</p>
                  <div className="text-sm text-gray-700">
                    {project.team.map((member, index) => (
                      <span key={index} className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs mr-2 mb-2">
                        {member}
                      </span>
                    ))}
                  </div>
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