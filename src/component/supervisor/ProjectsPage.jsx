import React, { useState, useRef, useEffect } from 'react';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { Search, Plus, MoreVertical, Eye, Edit2, Trash2, Facebook, Linkedin, X } from 'lucide-react';
import ProjectInfoModal from '../../layout/ProjectInfoModal';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './HomePage';
import { FaExclamationTriangle } from 'react-icons/fa';

function ProjectsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  
  // Informations du superviseur connecté 
  const [currentUser] = useState({
    id: 1,
    firstName: "Supervisor",
    lastName: "",
    email: "supervisor@esi-sba.dz",
    role: "Supervisor",
  });

  // Liste des projets
  const [projects, setProjects] = useState([
    { 
      id: 'PR001', 
      title: 'Site Web E-commerce', 
      state: 'approved', 
      createdOn: '15/03/2024',
      maxStudents: 4,
      description: 'Développement d\'une plateforme de vente en ligne complète avec panier, paiement intégré et gestion des commandes.',
      technologies: 'React, Node.js, MongoDB, Stripe API',
      team: ['Ahmed K.', 'Sara M.', 'Omar B.']
    },
    { 
      id: 'PR002', 
      title: 'Application Mobile Fitness', 
      state: 'approved', 
      createdOn: '22/02/2024',
      maxStudents: 3,
      description: 'Application de suivi de fitness avec plans d\'entraînement personnalisés et suivi des progrès.',
      technologies: 'React Native, Firebase, Redux',
      team: ['Yasmine L.', 'Karim R.']
    },
    { 
      id: 'PR003', 
      title: 'API REST Service Client', 
      state: 'rejected', 
      createdOn: '10/01/2024',
      maxStudents: 2,
      description: 'Conception et développement d\'API RESTful pour la gestion des clients et des commandes.',
      technologies: 'Express.js, PostgreSQL, JWT',
      team: ['Mohamed A.']
    },
    { 
      id: 'PR004', 
      title: 'Chatbot IA Support', 
      state: 'pending', 
      createdOn: '05/04/2024',
      maxStudents: 3,
      description: 'Assistant virtuel basé sur l\'IA pour le support client avec traitement du langage naturel.',
      technologies: 'Python, TensorFlow, Rasa, Docker',
      team: ['Amine B.', 'Leila H.']
    },
    { 
      id: 'PR005', 
      title: 'Base de Données Optimisée', 
      state: 'approved', 
      createdOn: '18/12/2023',
      maxStudents: 2,
      description: 'Optimisation des performances d\'une base de données existante et migration vers une nouvelle architecture.',
      technologies: 'PostgreSQL, MongoDB, Redis',
      team: ['Omar T.']
    },
    { 
      id: 'PR006', 
      title: 'Application de Gestion', 
      state: 'pending', 
      createdOn: '20/01/2024',
      maxStudents: 4,
      description: 'Application de gestion scolaire avec suivi des notes, présences et emplois du temps.',
      technologies: 'Vue.js, Laravel, MySQL',
      team: ['Samir K.', 'Nadia B.', 'Rachid M.']
    },
    { 
      id: 'PR007', 
      title: 'Site Vitrine Association', 
      state: 'rejected', 
      createdOn: '12/02/2024',
      maxStudents: 2,
      description: 'Site web responsive pour une association caritative avec système de dons en ligne.',
      technologies: 'HTML, CSS, JavaScript, PHP',
      team: ['Fatima Z.']
    },
  ]);

  // Ferme le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Redirige vers la page d'ajout de projet
  const handleAddProject = () => {
    navigate('/supervisor/addprojectpage');
  };

  // Affiche les informations du projet
  const handleProjectInfo = (project) => {
    setSelectedProject(project);
    setShowInfoModal(true);
    setOpenMenuId(null);
  };

  // Redirige vers la page de modification avec les données du projet
  const handleModifyProject = (project) => {
    navigate('/supervisor/modifyprojectpage', { state: { project } });
    setOpenMenuId(null);
  };

  // Ouvre le modal de confirmation de suppression
  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
    setOpenMenuId(null);
  };

  // Confirme la suppression et met à jour la liste
  const confirmDelete = () => {
    if (projectToDelete) {
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      console.log('Projet supprimé:', projectToDelete);
      setShowDeleteModal(false);
      setProjectToDelete(null);
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

  const handleChangePassword = (formData) => {
    console.log('🔐 Changement de mot de passe:', formData);
  };

  // Ouvre/ferme le menu des trois points
  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // ==================== COULEURS DES ÉTATS ====================
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

  // Texte à afficher pour chaque état
  const getStateText = (state) => {
    switch(state) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'pending': return 'Pending';
      default: return state;
    }
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Manage and track your projects
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Project Dashboard
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bouton d'ajout de projet */}
              <button
                onClick={handleAddProject}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap font-medium"
              >
                <Plus size={18} /> Add a new Project
              </button>
              
              {/* Barre de recherche */}
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
              
              <a 
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              
              <a 
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>

              <ProfileDropdown 
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* ==================== CONTENU PRINCIPAL ==================== */}
        <main className="flex-1 px-6 py-4 overflow-auto">
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-3 pb-1 border-b border-[#1e3a5f] inline-block ml-6">
            My Projects :
          </h2>

          {/* ==================== TABLEAU DES PROJETS ==================== */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible max-w-6xl ml-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">ID</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Title</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">State</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider" colSpan="2">Created on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs font-medium text-gray-900">{project.id}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">{project.title}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap pl-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStateColor(project.state)}`}>
                        {getStateText(project.state)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-600">{project.createdOn}</td>
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
                          className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-9999 py-1"
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

            {/* Message si aucun projet trouvé */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No projects found
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ==================== MODAL D'INFORMATION ( Affiche les détails complets du projet ) ==================== */}
      <ProjectInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        project={selectedProject}
        getStateColor={getStateColor}
        getStateText={getStateText}
      />

      {/* ==================== MODAL DE CONFIRMATION DE SUPPRESSION ==================== */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          {/* Overlay - ferme le modal quand on clique à l'extérieur */}
          <div 
            className="absolute inset-0"
            onClick={cancelDelete}
          ></div>
          
          {/* Contenu du modal */}
          <div className="bg-white w-full max-w-3xl mx-auto shadow-xl overflow-hidden relative z-10" style={{ borderRadius: '20px' }}>
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: '#193962' }}>Delete this Project</h3>
              <button
                onClick={cancelDelete}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {/* Message d'avertissement */}
              <div 
                className="p-5 mb-6" 
                style={{ 
                  backgroundColor: '#FFF4CC',
                  border: '1px solid #E2B46C',
                  borderRadius: '12px'
                }}
              >
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#E68A2E' }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: '#E68A2E' }}>Warning:</p>
                    <p className="text-sm" style={{ color: '#E68A2E' }}>• You cannot restore this project</p>
                  </div>
                </div>
              </div>
              
              <p className="text-base text-gray-700 mb-8">
                Are you sure that you want to continue?
              </p>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="px-6 py-1.5 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  style={{ borderRadius: '8px', color: '#787878' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-6 py-1.5 bg-red-400 hover:bg-red-500 text-white transition-colors text-sm font-medium"
                  style={{ borderRadius: '8px' }}
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