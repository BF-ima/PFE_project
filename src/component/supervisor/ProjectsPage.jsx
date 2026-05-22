import React, { useState, useRef, useEffect, useCallback } from 'react';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { Search, Plus, MoreVertical, Eye, Edit2, Trash2, X } from 'lucide-react';
import ProjectInfoModal from '../../layout/ProjectInfoModal';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './HomePage';
import { FaExclamationTriangle } from 'react-icons/fa';
import useCurrentUser from '../../hooks/useCurrentUser';

function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery,      setSearchQuery]      = useState('');
  const [openMenuId,       setOpenMenuId]       = useState(null);
  const [selectedProject,  setSelectedProject]  = useState(null);
  const [showInfoModal,    setShowInfoModal]    = useState(false);
  const [showDeleteModal,  setShowDeleteModal]  = useState(false);
  const [projectToDelete,  setProjectToDelete]  = useState(null);
  const [projects,         setProjects]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const menuRef   = useRef(null);
  const buttonRef = useRef(null);




const { currentUser } = useCurrentUser();

  // ==================== FETCH PROJECTS ====================
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:3000/api/projects/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erreur lors du chargement des projets');
        return;
      }
      setProjects(data.projects || []);
    } catch (err) {
      console.error('fetchProjects error:', err);
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ==================== CLOSE MENU ON OUTSIDE CLICK ====================
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openMenuId &&
        menuRef.current   && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // ==================== FILTER ====================
  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(project.id).includes(searchQuery)
  );

  // ==================== HANDLERS ====================
  const handleAddProject = () => navigate('/supervisor/addprojectpage');

  const handleProjectInfo = (project) => {
    setSelectedProject(project);
    setShowInfoModal(true);
    setOpenMenuId(null);
  };

  const handleModifyProject = (project) => {
    navigate('/supervisor/modifyprojectpage', { state: { project } });
    setOpenMenuId(null);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`http://localhost:3000/api/projects/${projectToDelete.id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Erreur lors de la suppression');
        return;
      }
      setProjects(prev => prev.filter(p => p.id !== projectToDelete.id));
      setShowDeleteModal(false);
      setProjectToDelete(null);
    } catch (err) {
      console.error('deleteProject error:', err);
      alert('Erreur serveur');
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };


  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // ==================== STATUS COLORS ====================
  const getStateColor = (state) => {
    switch (state?.toUpperCase()) {
      case 'VALIDATED': return 'bg-green-100 text-green-700';
      case 'REJECTED':  return 'bg-red-100 text-red-700';
      case 'PENDING':   return 'bg-yellow-100 text-yellow-700';
      case 'ASSIGNED':  return 'bg-blue-100 text-blue-700';
      case 'COMPLETED': return 'bg-gray-100 text-gray-700';
      default:          return 'bg-gray-100 text-gray-700';
    }
  };

  const getStateText = (state) => {
    switch (state?.toUpperCase()) {
      case 'VALIDATED': return 'Validated';
      case 'REJECTED':  return 'Rejected';
      case 'PENDING':   return 'Pending';
      case 'ASSIGNED':  return 'Assigned';
      case 'COMPLETED': return 'Completed';
      default:          return state || 'N/A';
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : 'N/A';

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16">

        {/* ==================== HEADER ==================== */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Manage and track your projects</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddProject}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap font-medium"
              >
                <Plus size={18} /> Add a new Project
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search Project"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-72 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                />
              </div>

              

              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

        {/* ==================== MAIN ==================== */}
        <main className="flex-1 px-6 py-4 overflow-auto">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-3 pb-1 border-b border-[#1e3a5f] inline-block ml-6">
            My Projects :
          </h2>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="ml-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible max-w-6xl ml-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">ID</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Title</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Speciality</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider" colSpan="2">Created on</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900">
                        {project.id}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">
                        {project.title}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">
                        {project.speciality_name}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap pl-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStateColor(project.status)}`}>
                          {getStateText(project.status)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-600">
                        {formatDate(project.created_at)}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center relative w-6 pl-1">
                        <button
                          ref={openMenuId === project.id ? buttonRef : null}
                          onClick={(e) => toggleMenu(project.id, e)}
                          className="p-0.5 text-[#1e3a5f] hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <MoreVertical size={14} />
                        </button>

                        {openMenuId === project.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1"
                          >
                            <button
                              onClick={() => handleProjectInfo(project)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Eye size={16} className="text-gray-500" /> Project Information
                            </button>
                            <button
                              onClick={() => handleModifyProject(project)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Edit2 size={16} className="text-gray-500" /> Modify
                            </button>
                            <button
                              onClick={() => handleDeleteClick(project)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={16} className="text-gray-500" /> Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No projects found
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ==================== PROJECT INFO MODAL ==================== */}
      <ProjectInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        project={selectedProject}
        getStateColor={getStateColor}
        getStateText={getStateText}
      />

      {/* ==================== DELETE CONFIRMATION MODAL ==================== */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0" onClick={cancelDelete} />
          <div className="bg-white w-full max-w-3xl mx-auto shadow-xl overflow-hidden relative z-10 rounded-2xl">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#193962]">Delete this Project</h3>
              <button onClick={cancelDelete} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              <div className="p-5 mb-6 bg-[#FFF4CC] border border-[#E2B46C] rounded-xl">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[#E68A2E]" />
                  <div>
                    <p className="text-sm font-medium text-[#E68A2E]">Warning:</p>
                    <p className="text-sm text-[#E68A2E]">• You cannot restore this project</p>
                  </div>
                </div>
              </div>

              <p className="text-base text-gray-700 mb-8">
                Are you sure that you want to continue?
              </p>

              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelDelete}
                  className="px-6 py-1.5 border border-gray-300 text-[#787878] hover:bg-gray-50 transition-colors text-sm font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-1.5 bg-red-400 hover:bg-red-500 text-white transition-colors text-sm font-medium rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectsPage;