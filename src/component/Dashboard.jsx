import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  User,
  Lock,
  LogOut as LogoutIcon,
  X,
  Calendar,
} from "lucide-react";

// ==================== Composant ProfileDropdown ====================
const ProfileDropdown = ({ user, onLogout, onChangePassword }) => {
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

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      );
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#18335E] to-[#2D8FBF] flex items-center justify-center text-white font-semibold shadow-sm">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
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

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
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
                  className="px-4 py-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors"
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

// ==================== COMPOSANTS EXISTANTS ====================
const ProjectCard = ({ project }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:border-gray-300">
    <div className="space-y-4">
      {/* Project Name */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Name</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{project.name}</p>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
    >
      <ChevronLeft size={16} />
    </button>
    <button
      onClick={() => onPageChange(1)}
      className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === 1 ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-gray-300 hover:bg-gray-50"}`}
    >
      1
    </button>
    {totalPages > 2 && (
      <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 hover:bg-gray-50">
        <MoreHorizontal size={16} />
      </button>
    )}
    {totalPages > 1 && (
      <button
        onClick={() => onPageChange(totalPages)}
        className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === totalPages ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-gray-300 hover:bg-gray-50"}`}
      >
        {totalPages}
      </button>
    )}
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
    >
      <ChevronRight size={16} />
    </button>
  </div>
);

// ==================== COMPOSANT PRINCIPAL ====================
function ProjectDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };
  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

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
          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}

          {/* No Results */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Aucun projet trouvé</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ProjectDashboard;
