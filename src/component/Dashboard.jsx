import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import ProfileDropdown from "./ProfileDropDown";
import ProjectInfoModel from "../layout/ProjectInfoModel";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  Calendar,
} from "lucide-react";

// ==================== COMPOSANTS Projectcard ====================
export const ProjectCard = ({ project, onClick }) => (
  <div
    onClick={() => onClick(project)}
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:cursor-pointer hover:shadow-md transition-all duration-200 hover:border-gray-300"
  >
    <div className="space-y-4">
      {/* Project Name */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {project.name}
        </h3>
      </div>

      {/* Summary */}
      <div>
        <p className="text-sm text-gray-500 line-clamp-3">{project.summary}</p>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={16} className="text-gray-400" />
          <span>Sent by : {project.supervisor}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-gray-400" />
          <span>{new Date().toLocaleDateString("en-GB")}</span>
        </div>
      </div>
    </div>
  </div>
);
// ==================== COMPOSANT Pagination ====================
export const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-3 mt-8">
    {/* Previous button */}
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-[#1e3a5f] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
    >
      &lt;
    </button>

    {/* First page */}
    <button
      onClick={() => onPageChange(1)}
      className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-sm border font-medium transition-all ${
        currentPage === 1
          ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
          : "bg-white text-[#1e3a5f] border-gray-200 hover:bg-gray-50"
      }`}
    >
      1
    </button>

    {/* Ellipsis if more than 2 pages */}
    {totalPages > 2 && (
      <div className="w-12 h-12 flex items-center justify-center text-gray-400">
        ...
      </div>
    )}

    {/* Last page */}
    {totalPages > 1 && (
      <button
        onClick={() => onPageChange(totalPages)}
        className={`w-12 h-12 flex items-center justify-center rounded-lg shadow-sm border font-medium transition-all ${
          currentPage === totalPages
            ? "bg-[#1e3a5f] text-white border-[#1e3a5f]"
            : "bg-white text-[#1e3a5f] border-gray-200 hover:bg-gray-50"
        }`}
      >
        {totalPages}
      </button>
    )}

    {/* Next button */}
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm border border-gray-200 text-[#1e3a5f] font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
    >
      &gt;
    </button>
  </div>
);

// ==================== COMPOSANT PRINCIPAL ====================
function ProjectDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  // Ajoutez ces lignes dans ProjectDashboard, avec vos autres useState :
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  const [projects] = useState([
    {
      id: 1,
      name: "Site Web E-commerce",
      supervisor: "Marie Dupont",
      state: "En cours",
      summary:
        "Développement d'une plateforme de vente en ligne avec paiement intégré",
    },
    {
      id: 2,
      name: "Application Mobile",
      supervisor: "Jean Martin",
      state: "En attente",
      summary: "Création d'une app de suivi de fitness pour iOS et Android",
    },
    {
      id: 3,
      name: "Migration Cloud",
      supervisor: "Sophie Bernard",
      state: "Terminé",
      summary: "Migration complète de l'infrastructure vers AWS",
    },
    {
      id: 4,
      name: "Refonte UI/UX",
      supervisor: "Lucas Petit",
      state: "En cours",
      summary: "Modernisation de l'interface utilisateur du dashboard admin",
    },
    {
      id: 5,
      name: "API REST",
      supervisor: "Emma Richard",
      state: "En cours",
      summary:
        "Conception et développement des nouvelles API pour le service client",
    },
    {
      id: 6,
      name: "Sécurité Réseau",
      supervisor: "Thomas Moreau",
      state: "En attente",
      summary: "Audit et renforcement de la sécurité du réseau interne",
    },
    {
      id: 7,
      name: "Base de Données",
      supervisor: "Camille Roux",
      state: "Terminé",
      summary: "Optimisation des performances et mise à jour du schéma",
    },
    {
      id: 8,
      name: "Chatbot IA",
      supervisor: "Nicolas Blanc",
      state: "En cours",
      summary: "Intégration d'un assistant virtuel pour le support client",
    },
    {
      id: 9,
      name: "Chatbot IA",
      supervisor: "Nicolas Blanc",
      state: "En cours",
      summary: "Intégration d'un assistant virtuel pour le support client",
    },
    {
      id: 10,
      name: "Chatbot IA",
      supervisor: "Nicolas Blanc",
      state: "En cours",
      summary: "Intégration d'un assistant virtuel pour le support client",
    },
    {
      id: 11,
      name: "Chatbot IA",
      supervisor: "Nicolas Blanc",
      state: "En cours",
      summary: "Intégration d'un assistant virtuel pour le support client",
    },
  ]);

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.state.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const projectsPerPage = 8;
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const paginatedProjects = filteredProjects.slice(
    startIndex,
    startIndex + projectsPerPage,
  );
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };
  const handleCloseModel = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };
  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModel();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);
  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
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

            {/* ✅ Right side: Search + Profile (aligned to far right) */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search Project"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-3 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-gray-50"
                />
              </div>

              {/* ✅ Profile Dropdown - Pushed to far right with ml-auto */}
              <div className="ml-auto">
                <ProfileDropdown
                  user={currentUser}
                  onLogout={handleLogout}
                  onChangePassword={handleChangePassword}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="p-8 min-h-full flex flex-col">
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {paginatedProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={handleProjectClick}
                />
              ))}
            </div>

            {/* No Results */}
            {filteredProjects.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Aucun projet trouvé</p>
              </div>
            )}

            <div className="mt-auto pt-8">
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </main>
      </div>
      {/* Project Info Modal */}
      {isModalOpen && (
        <ProjectInfoModel
          project={selectedProject}
          onClose={handleCloseModel}
          onClick={handleProjectClick}
        />
      )}
    </div>
  );
}

export default ProjectDashboard;
