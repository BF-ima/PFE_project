import React, { useState, useRef, useEffect } from 'react';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { Search, Facebook, Linkedin, User, Calendar, Lock, LogOut as LogoutIcon, X } from 'lucide-react';
import { Pagination } from '../Dashboard';
import ProjectInfoModal from '../../layout/ProjectInfoModal'; 
import { useNavigate } from 'react-router-dom';
import { FaUserCircle } from 'react-icons/fa';
import useCurrentUser from '../../hooks/useCurrentUser';

// ==================== ProjectCard ====================
const ProjectCard = ({ project, onClick }) => (
  <div 
    className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="space-y-2 sm:space-y-3">
      {/* Nom du projet */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-0.5 sm:mb-1">Name</h3>
        <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{project.name}</p>
      </div>

      {/* summary */}
      <div>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-3">{project.summary}</p>
      </div>

      {/* supervisor+date */}
      <div className="pt-1 sm:pt-2 border-t border-gray-100 space-y-0.5 sm:space-y-1">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <User size={12} className="sm:w-4 sm:h-4 text-gray-400" />
          <span className="truncate">Sent by: {project.supervisor}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <Calendar size={12} className="sm:w-4 sm:h-4 text-gray-400" />
          <span>{new Date().toLocaleDateString("en-GB")}</span>
        </div>
      </div>
    </div>
  </div>
);

// ==================== ProfileDropdown ====================
export const ProfileDropdown = ({ user, onLogout}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Gestion du changement de mot de passe
const handlePasswordChange = async (e) => {
  e.preventDefault();
  setPasswordError("");
  setPasswordSuccess("");

  if (passwordForm.newPassword.length < 6) {
    setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères");
    return;
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    setPasswordError("Les mots de passe ne correspondent pas");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const res   = await fetch("http://localhost:3000/api/auth/change-password", {
      method:  "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization:  `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword:     passwordForm.newPassword,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setPasswordError(data.message || "Erreur lors du changement de mot de passe");
      return;
    }

    setPasswordSuccess("Mot de passe modifié avec succès !");
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setTimeout(() => { setShowPasswordModal(false); setPasswordSuccess(""); }, 2000);

  } catch (err) {
    console.error("changePassword error:", err);
    setPasswordError("Erreur serveur");
  }
};

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#18335E] to-[#2D8FBF] flex items-center justify-center text-white shadow-sm">
          <FaUserCircle size={24} />
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user?.firstName} {user?.lastName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Rôle: {user?.role}</p>
          </div>
          <button
            onClick={() => {
              setShowPasswordModal(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Lock size={16} className="text-gray-500" /> Change Password
          </button>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <LogoutIcon size={16} /> Logout
          </button>
        </div>
      )}

      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock size={20} /> Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {passwordError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Données du superviseur connecté
const { currentUser } = useCurrentUser();
  // Liste des projets
  const [projects] = useState([
    {id: 1,name: "Site Web E-commerce",supervisor: "Marie Dupont",state: "En cours",summary: "Développement d'une plateforme de vente en ligne avec paiement intégré",},
    {id: 2,name: "Application Mobile Fitness",supervisor: "Marie Dupont",state: "En cours",summary: "Création d'une app de suivi de fitness pour iOS et Android",},
    {id: 3,name: "API REST Service Client",supervisor: "Marie Dupont",state: "rejected",summary: "Conception et développement des API pour service client",},
    {id: 4,name: "Chatbot IA Support",supervisor: "Marie Dupont",state: "approved",summary: "Assistant virtuel pour support client",},
    {id: 5,name: "Base de Données Optimisée",supervisor: "Marie Dupont",state: "approved",summary: "Optimisation des performances et mise à jour du schéma",},
    {id: 6,name: "Application de Gestion Scolaire",supervisor: "Marie Dupont",state: "rejected",summary: "Système de gestion des notes et présences",},
    {id: 7,name: "Site Vitrine pour Association",supervisor: "Marie Dupont",state: "approved",summary: "Développement site web responsive avec animations",},
    {id: 8,name: "Application Météo",supervisor: "Marie Dupont",state: "approved",summary: "Application météo avec API OpenWeatherMap",},
    {id: 9,name: "Application de Chat",supervisor: "Marie Dupont",state: "rejected",summary: "Application de messagerie instantanée avec socket.io",}
  ]);

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  // Gestion du changement de mot de passe
  const handleChangePassword = (formData) => {
    console.log('🔐 Changement de mot de passe:', formData);
  };

  // When you click on the card the project info appears
  const handleProjectClick = (project) => {
    setSelectedProject({
      id: `PR00${project.id}`,
      title: project.name,
      state: project.state === "En cours" ? "pending" : project.state,
      createdOn: new Date().toLocaleDateString("en-GB"),
      maxStudents: 4,
      description: project.summary,
      technologies: "React, Node.js, MongoDB",
      team: ["Ahmed K.", "Sara M.", "Omar B."]
    });
    setShowInfoModal(true);
  };

  // Couleurs des états
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

  // Texte des états
  const getStateText = (state) => {
    switch(state) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return state;
    }
  };

  // Filtrage des projets
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const projectsPerPage = 8;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">
                Project Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
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
                  className="pl-8 sm:pl-12 pr-2 sm:pr-4 py-2 sm:py-3 w-48 sm:w-80 text-xs sm:text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-gray-50"
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

              <ProfileDropdown 
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 h-full flex flex-col">
            {/* Grille de cartes */}
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
                  <p className="text-sm sm:text-lg">No projects found</p>
                </div>
              )}
            </div>

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

      {/* Modal project info */}
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
export default HomePage;