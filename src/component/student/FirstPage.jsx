import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { Search, Facebook, Linkedin, User, Calendar, Lock, LogOut as LogoutIcon, X, ChevronDown, Filter } from 'lucide-react';
import { Pagination } from '../Dashboard';
import { FaUserCircle } from 'react-icons/fa';
import ProjectInfoModal from '../../layout/ProjectInfoModal';

// Affichage d'une carte projet
export const ProjectCard = ({ project, onClick }) => (
  <div 
    className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300 cursor-pointer"
    onClick={onClick}
  >
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-start gap-2">
        <h3 className="text-sm font-semibold text-gray-600 shrink-0">Name:</h3>
        <p className="text-sm font-medium text-gray-800">{project.name}</p>
      </div>
      
      {/* summary du projet */}
      <div>
        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2 sm:line-clamp-3">{project.summary}</p>
      </div>
      
      {/* Informations supp */}
      <div className="pt-1 sm:pt-2 border-t border-gray-100 space-y-0.5 sm:space-y-1">
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <User size={12} className="sm:w-4 sm:h-4 text-gray-400" />
          <span className="truncate">Supervisor: {project.supervisor}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
          <Calendar size={12} className="sm:w-4 sm:h-4 text-gray-400" />
          <span>{project.createdAt}</span>
        </div>
      </div>
    </div>
  </div>
);

// Menu déroulant du profil utilisateur
export const ProfileDropdown = ({ user, onLogout, onChangePassword }) => {
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

  // Ferme le dropdown lors d'un clic à l'extérieur
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
  const handlePasswordChange = (e) => {
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
    onChangePassword(passwordForm);
    setPasswordSuccess("Mot de passe modifié avec succès !");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess("");
    }, 2000);
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
            <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Rôle: {user?.role}</p>
          </div>
          <button
            onClick={() => { setShowPasswordModal(true); setIsOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
          >
            <Lock size={16} className="text-gray-500" /> Change Password
          </button>
          <button
            onClick={() => { onLogout(); setIsOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
              <h3 className="text-lg font-semibold flex items-center gap-2"><Lock size={20} /> Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-white hover:text-gray-200"><X size={24} /></button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordSuccess && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">{passwordSuccess}</div>}
              {passwordError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{passwordError}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input type="password" required value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input type="password" required minLength={6} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input type="password" required value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0]">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  const [currentUser] = useState({
    id: 1,
    firstName: "Student",
    lastName: "",
    email: "student@esi-sba.dz",
    role: "Student",
  });

  // ==================== LISTE DES PROJETS APPROVED ====================
  const [allProjects] = useState([
    {id: 1, name: "Site Web E-commerce", supervisor: "Dr. Mohamed Benali", state: "approved", createdAt: "15/03/2024", summary: "Développement d'une plateforme de vente en ligne complète avec panier d'achat, paiement sécurisé Stripe et système de gestion des commandes en temps réel."},
    {id: 2, name: "Application Mobile Fitness", supervisor: "Dr. Sarah Ahmed", state: "approved", createdAt: "22/02/2024", summary: "Création d'une application mobile de suivi de fitness avec plans d'entraînement personnalisés, suivi des calories et synchronisation avec les montres connectées."},
    {id: 3, name: "Chatbot IA pour Support Client", supervisor: "Dr. Karim Bensaid", state: "approved", createdAt: "10/01/2024", summary: "Développement d'un assistant virtuel intelligent utilisant le traitement du langage naturel (NLP) pour répondre automatiquement aux questions des clients 24h/24."},
    {id: 4, name: "Plateforme E-learning", supervisor: "Dr. Mohamed Benali", state: "approved", createdAt: "05/04/2024", summary: "Création d'une plateforme de formation en ligne avec vidéos interactives, quiz, certificats et suivi de progression des apprenants."},
    {id: 5, name: "Application de Gestion de Stock", supervisor: "Dr. Sarah Ahmed", state: "approved", createdAt: "18/12/2023", summary: "Application web de gestion d'inventaire avec scanner de codes-barres, alertes de stock minimum et génération de rapports automatiques."},
    {id: 6, name: "Système de Gestion des Réclamations", supervisor: "Dr. Karim Bensaid", state: "approved", createdAt: "20/01/2024", summary: "Plateforme de gestion des réclamations clients avec suivi en temps réel, notification par email et tableau de bord analytique."},
    {id: 7, name: "Application de Réservation Hôtelière", supervisor: "Dr. Mohamed Benali", state: "approved", createdAt: "12/02/2024", summary: "Système de réservation en ligne pour hôtels avec gestion des chambres, paiement en ligne et avis clients."},
    {id: 8, name: "Plateforme de Livraison de Repas", supervisor: "Dr. Sarah Ahmed", state: "approved", createdAt: "25/01/2024", summary: "Application de commande de repas en ligne avec suivi en temps réel de la livraison et notation des restaurants."},
    {id: 9, name: "Système de Gestion de Projet Agile", supervisor: "Dr. Karim Bensaid", state: "approved", createdAt: "08/03/2024", summary: "Outil de gestion de projets inspiré de Trello/Jira avec tableaux Kanban, sprints et suivi des tâches en équipe."},
  ]);

  // Seulement les projets approved
  const projects = allProjects.filter(project => project.state === "approved");

  // Extraction de la liste des superviseurs 
  const supervisorsList = [...new Set(projects.map(project => project.supervisor))];

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

  // when you click sur un projet
  const handleProjectClick = (project) => {
    setSelectedProject({
      id: `PR00${project.id}`,
      title: project.name,
      state: project.state,
      createdOn: project.createdAt,
      maxStudents: 4,
      description: project.summary,
      team: ["Ahmed K.", "Sara M.", "Omar B."]
    });
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
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupervisor = selectedSupervisor ? project.supervisor === selectedSupervisor : true;
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
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-8 py-0.5 sm:py-1 flex-1 flex flex-col overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-3">
              {paginatedProjects.map((project) => (
                <ProjectCard 
                  key={project.id}
                  project={project} 
                  onClick={() => handleProjectClick(project)}
                />
              ))}
            </div>

            {/* Message si aucun projet trouvé */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <p className="text-sm sm:text-lg">No projects found</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-auto">
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