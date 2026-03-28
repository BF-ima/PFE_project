import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar";
import ProfileDropdown from "../ProfileDropDown";
import { ApproveProjectModal, RejectProjectModal } from "../../layout/ProjectApprovalModals";
import { Search, User, Calendar, Check, X, Clock, FileText } from "lucide-react";

const ProposalReview = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  
  // ✅ States pour les modales
  const [selectedProject, setSelectedProject] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // User actuel
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // Données mockées des projets
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Système de Gestion des PFE",
      summary: "Développement d'une plateforme web complète pour la gestion des projets de fin d'études avec suivi en temps réel.",
      supervisor: "Dr. Marie Dupont",
      date: "2024-01-15",
      status: "pending",
    },
    {
    id: 2,
    name: "Application Mobile E-commerce",
    summary: "Création d'une application mobile cross-platform...",
    supervisor: "Prof. Ahmed Benali",
    date: "2024-01-14",
    status: "approved",
  },
  {
    id: 3,
    name: "Plateforme E-learning",
    summary: "Conception d'une plateforme d'apprentissage en ligne...",
    supervisor: "Dr. Sarah Johnson",
    date: "2024-01-13",
    status: "rejected",
  },
  ]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  // ✅ Handlers pour les modales
  const handleApproveClick = (project) => {
    setSelectedProject(project);
    setShowApproveModal(true);
  };

  const handleRejectClick = (project) => {
    setSelectedProject(project);
    setShowRejectModal(true);
  };

  const handleApproveConfirm = (comment) => {
    console.log(`✅ Project "${selectedProject.name}" approved with comment:`, comment);
    
    // ✅ Mise à jour du statut du projet
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? { ...p, status: "approved" } : p
    ));
    
    setShowApproveModal(false);
    setSelectedProject(null);
  };

  const handleRejectConfirm = (reason) => {
    console.log(`❌ Project "${selectedProject.name}" rejected. Reason:`, reason);
    
    // ✅ Mise à jour du statut du projet
    setProjects(prev => prev.map(p => 
      p.id === selectedProject.id ? { ...p, status: "rejected" } : p
    ));
    
    setShowRejectModal(false);
    setSelectedProject(null);
  };

  // Filtrage des projets
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.supervisor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calcul des statistiques
  const pendingCount = projects.filter((p) => p.status === "pending").length;
  const approvedCount = projects.filter((p) => p.status === "approved").length;
  const rejectedCount = projects.filter((p) => p.status === "rejected").length;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Manage and track your projects
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Proposal Review and approval
              </h1>
            </div>

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
                className="pl-12 pr-4 py-2 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
            </div>

            {/* Profile Dropdown */}
            <div className="ml-4">
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">


          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Pending */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Pending</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{pendingCount}</p>
                </div>
              </div>
            </div>

            {/* Approved */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Approved</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{approvedCount}</p>
                </div>
              </div>
            </div>

            {/* Rejected */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rejected</p>
                  <p className="text-2xl font-bold text-[#1e3a5f]">{rejectedCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {/* Project Name */}
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-2">
                  {project.name}
                </h3>

                {/* Summary */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.summary}
                </p>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User size={16} />
                    <span>Sent by: {project.supervisor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>{formatDate(project.date)}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    project.status === "approved" 
                      ? "bg-green-100 text-green-700 border-green-200"
                      : project.status === "rejected"
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-yellow-100 text-yellow-700 border-yellow-200"
                  }`}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>

                {/* Action Buttons - Only show for pending */}
                {project.status === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveClick(project)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(project)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <X size={16} />
                      Reject
                    </button>
                  </div>
                )}

                {/* Read-only status for approved/rejected */}
                {project.status !== "pending" && (
                  <p className="text-sm text-gray-500 italic">
                    Decision already made
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No projects found</p>
              <p className="text-gray-400 text-sm mt-2">
                Try adjusting your search criteria
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ✅ Modals - Placed at root level */}
      <ApproveProjectModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        projectName={selectedProject?.name}
        onConfirm={handleApproveConfirm}
      />

      <RejectProjectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        projectName={selectedProject?.name}
        onConfirm={handleRejectConfirm}
      />
    </div>
  );
};

export default ProposalReview;