import React, { useEffect, useState } from 'react';
import { X, ArrowLeft } from 'lucide-react';

const ProjectInfoModal = ({ isOpen, onClose, project, getStateColor, getStateText }) => {
  const [fullProject, setFullProject] = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (!isOpen || !project?.id) return;

    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res   = await fetch(`http://localhost:3000/api/projects/${project.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.message || 'Erreur lors du chargement');
          return;
        }
        setFullProject(data.project);
      } catch (err) {
        console.error('fetchProject error:', err);
        setError('Erreur serveur');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [isOpen, project?.id]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setFullProject(null);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : 'N/A';

  const supervisorName  = fullProject?.teacher_name
    || fullProject?.external_supervisor_name  || 'N/A';
  const supervisorEmail = fullProject?.teacher_email
    || fullProject?.external_supervisor_email || 'N/A';
  const supervisorPhone = fullProject?.teacher_phone
    || fullProject?.external_supervisor_phone || 'N/A';
  const supervisorType  = fullProject?.teacher_id
    ? 'Internal Supervisor' : 'External Supervisor';

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

      {/* Overlay */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-2xl w-full max-w-4xl mx-auto shadow-2xl overflow-hidden relative z-10">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-3 relative flex items-center">
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

        {/* Body */}
        <div className="p-6">

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Content */}
          {!loading && !error && fullProject && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card 1 — General Information */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                  <h3 className="text-base font-medium text-gray-800 text-center">General Information</h3>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500">ID</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{fullProject.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Title</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{fullProject.title}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Max Students</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{fullProject.max_students}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStateColor(fullProject.status)}`}>
                      {getStateText(fullProject.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">Created On</p>
                    <p className="text-sm text-gray-900 mt-1 font-medium">{formatDate(fullProject.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Card 2 — Details */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                  <h3 className="text-base font-medium text-gray-800 text-center">Details</h3>
                </div>
                <div className="p-5 space-y-5 overflow-y-auto max-h-64">

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed break-words">
                      {fullProject.description || 'No description provided'}
                    </p>
                  </div>

                  {/* Supervisor */}
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Supervisor — {supervisorType}
                    </p>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 font-medium">{supervisorName}</p>
                      <p className="text-xs text-gray-500">{supervisorEmail}</p>
                      <p className="text-xs text-gray-500">{supervisorPhone}</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoModal;