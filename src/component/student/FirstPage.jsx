import React, { useState, useRef, useEffect , useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { Search, Facebook, Linkedin, User, Calendar, Lock, LogOut as LogoutIcon, X, ChevronDown, Filter } from 'lucide-react';
import { Pagination } from '../Dashboard';
import { FaUserCircle } from 'react-icons/fa';
import ProjectInfoModal from '../../layout/ProjectInfoModal';
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';

// Affichage d'une carte projet
export const ProjectCard = ({ project, onClick }) => (
  <div
    className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="space-y-2 sm:space-y-3">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-1">{project.title}</h3>
      </div>
      <div>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-3">
          {project.description || "No description provided"}
        </p>
      </div>
      <div className="pt-1 sm:pt-2 border-t border-gray-100 space-y-0.5 sm:space-y-1">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <User size={12} className="sm:w-4 sm:h-4 text-gray-400" />
          <span className="truncate">
            Sent by: {project.teacher_name || project.external_supervisor_name || "Supervisor"}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <Calendar size={12} className="sm:w-4 sm:h-4 text-gray-400" />
          <span>{project.created_at ? new Date(project.created_at).toLocaleDateString("en-GB") : "N/A"}</span>
        </div>
      </div>
    </div>
  </div>
);

// Filtrer par superviseur
export const SupervisorDropdown = ({ supervisors, selectedSupervisor, onSelectSupervisor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Ferme le dropdown lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full text-sm text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors whitespace-nowrap font-medium"
      >
        <Filter size={16} />
        {selectedSupervisor ? selectedSupervisor : "All"}
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
          <button
            onClick={() => {
              onSelectSupervisor('');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${!selectedSupervisor ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
          >
            All Supervisors
          </button>
          {supervisors.map((supervisor) => (
            <button
              key={supervisor}
              onClick={() => {
                onSelectSupervisor(supervisor);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${selectedSupervisor === supervisor ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
            >
              {supervisor}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

function FirstPage() {
  const navigate = useNavigate();
  const [searchQuery,     setSearchQuery]     = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInfoModal,   setShowInfoModal]   = useState(false);
  const [projects,        setProjects]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState('');


    // ==================== DONNÉES UTILISATEUR ====================
const { currentUser } = useCurrentUser();


  // ── Fetch all VALIDATED projects ──
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:3000/api/projects/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Erreur'); return; }

      // Show only VALIDATED projects
      const validated = (data.projects || []).filter(p => p.status === 'VALIDATED');
      setProjects(validated);
    } catch (err) {
      console.error('fetchProjects error:', err);
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Extraction de la liste des superviseurs 
  const supervisorsList = [...new Set(
  projects.map(p => p.teacher_name || p.external_supervisor_name).filter(Boolean)
  )];

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };


  // when you click sur un projet
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowInfoModal(true);
  };

  // Couleur selon l'état du projet
  const getStateColor = (state) => {
    switch(state) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Texte selon l'état du projet
  const getStateText = (state) => {
    switch(state) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return state;
    }
  };

  // Filtrage des projets
  const filteredProjects = projects.filter(project => {
  const matchesSearch = (project.title || '').toLowerCase().includes(searchQuery.toLowerCase());
  const matchesSupervisor = selectedSupervisor
    ? (project.teacher_name || project.external_supervisor_name) === selectedSupervisor
    : true;
  return matchesSearch && matchesSupervisor;
  });

  // Pagination
  const projectsPerPage = 8;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <StudentSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        {/* header de la page */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Filtre par superviseur */}
              <SupervisorDropdown
                supervisors={supervisorsList}
                selectedSupervisor={selectedSupervisor}
                onSelectSupervisor={setSelectedSupervisor}
              />
              
              {/* Barre de recherche */}
              <div className="relative">
                <Search 
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" 
                  size={16} 
                />
                <input
                  type="text"
                  placeholder="Search Project"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-12 pr-2 sm:pr-4 py-2 sm:py-3 w-40 sm:w-64 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-gray-50"
                />
              </div>
         
              <a 
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              
              <a 
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>

              {/* Menu déroulant du profil */}
              <ProfileDropdown 
                user={currentUser}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
                  <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 h-full flex flex-col">
        
                    {/* Loading */}
                    {loading && (
                      <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
        
                    {/* Error */}
                    {error && !loading && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                        {error}
                      </div>
                    )}
        
                    {/* Grid */}
                    {!loading && !error && (
                      <div className="flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
                          {paginatedProjects.map((project) => (
                            <ProjectCard
                              key={project.id}
                              project={project}
                              onClick={() => handleProjectClick(project)}
                            />
                          ))}
                        </div>
        
                        {filteredProjects.length === 0 && (
                          <div className="text-center py-6 sm:py-8 text-gray-500">
                            <p className="text-sm sm:text-lg">No validated projects found</p>
                          </div>
                        )}
                      </div>
                    )}
        
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-4 shrink-0">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    )}
                  </div>
                </main>
              </div>
        

      {/* Détails du projet */}
      <ProjectInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        project={selectedProject}
        getStateColor={getStateColor}
        getStateText={getStateText}
      />
    </div>
  );
}

export default FirstPage;