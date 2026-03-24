import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../layout/Sidebar";
import { ProfileDropdown } from './supervisor/HomePage';
import ProjectInfoModal from '../layout/ProjectInfoModal';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  X,
  Calendar,
  Check,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import useCurrentUser from "../hooks/useCurrentUser";


// ==================== StatCard ====================
const StatCard = ({ icon, label, count, color, onClick, isActive }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-xl p-5 shadow-sm border flex items-center gap-4 flex-1 cursor-pointer transition-all duration-200
      ${isActive ? 'border-gray-300' : 'border-gray-200 hover:shadow-md'}`}
  >
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-[#1e3a5f]">{count}</p>
    </div>
  </div>
);

// ==================== ApproveModal ====================
const ApproveModal = ({ project, onConfirm, onClose }) => {
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-xl w-full max-w-md relative z-10 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">Approve the Project</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-4">
            You are about to approve{" "}
            <span className="font-medium text-gray-700">"{project?.title}"</span>.{" "}
            You may add conditions or comments (optional).
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment or Condition
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 resize-none text-sm"
            placeholder="Optional comment..."
          />
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button onClick={() => onConfirm(comment)}
            className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== RejectModal ====================
const RejectModal = ({ project, onConfirm, onClose }) => {
  const [reason,    setReason]    = useState('');
  const [showError, setShowError] = useState(false);

  const handleConfirm = () => {
    if (!reason.trim()) { setShowError(true); return; }
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-xl w-full max-w-md relative z-10 shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-base font-semibold text-gray-800">Reject the Project</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-4">
            Please specify the reason for rejecting{" "}
            <span className="font-medium text-gray-700">"{project?.title}"</span>.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason of rejection <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setShowError(false); }}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none text-sm ${
              showError ? 'border-red-400' : 'border-gray-200'
            }`}
            placeholder="Enter rejection reason..."
          />
          {showError && (
            <p className="text-red-500 text-xs mt-1">The reason for rejection is required.</p>
          )}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ProjectCard ====================
const ProjectCard = ({ project, onApprove, onReject, onInfo }) => {
  const formatDate     = (d) => d ? new Date(d).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
  const supervisorName = project.teacher_name || project.external_supervisor_name || "Supervisor";
  const isPending      = project.status === "PENDING";

  return (
    <div
      onClick={() => onInfo(project)}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 flex flex-col gap-3 cursor-pointer"
    >
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1 break-words">{project.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words">
          {project.description || "No description provided"}
        </p>
      </div>

      <div className="pt-2 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={15} className="text-gray-400" />
          <span>Sent by : {supervisorName}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={15} className="text-gray-400" />
          <span>{formatDate(project.created_at)}</span>
        </div>
      </div>

      {/* Approve / Reject buttons only for pending — stop propagation so card click doesn't fire */}
      {isPending && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(project); }}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <Check size={13} /> Approve
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(project); }}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors"
          >
            <X size={13} /> Reject
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== Pagination ====================
export const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2 mt-8">
    <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
      <ChevronLeft size={16} />
    </button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <button key={page} onClick={() => onPageChange(page)}
        className={`w-8 h-8 flex items-center justify-center rounded border ${
          currentPage === page ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-gray-300 hover:bg-gray-50"
        }`}>
        {page}
      </button>
    ))}
    <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
      className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
      <ChevronRight size={16} />
    </button>
  </div>
);

// ==================== COMPOSANT PRINCIPAL ====================
function ProjectDashboard() {
  const [searchQuery,      setSearchQuery]      = useState("");
  const [currentPage,      setCurrentPage]      = useState(1);
  const [projects,         setProjects]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [activeFilter,     setActiveFilter]     = useState("PENDING");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal,  setShowRejectModal]  = useState(false);
  const [showInfoModal,    setShowInfoModal]    = useState(false);
  const [selectedProject,  setSelectedProject]  = useState(null);
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();

  // ── Fetch all projects ──
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:3000/api/projects/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Erreur"); return; }
      setProjects(data.projects || []);
    } catch (err) {
      console.error("fetchProjects error:", err);
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Open modals ──
  const handleApproveClick = (project) => {
    setSelectedProject(project);
    setShowApproveModal(true);
  };

  const handleRejectClick = (project) => {
    setSelectedProject(project);
    setShowRejectModal(true);
  };

  const handleInfoClick = (project) => {
    setSelectedProject(project);
    setShowInfoModal(true);
  };

  // ── Handle filter change ──
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    setSearchQuery("");
  };

  // ── Confirm approve ──
  const handleApproveConfirm = async (comment) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`http://localhost:3000/api/projects/${selectedProject.id}/status`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: "VALIDATED", comment }),
      });
      if (res.ok) {
        setProjects(prev => prev.map(p =>
          p.id === selectedProject.id ? { ...p, status: "VALIDATED" } : p
        ));
        setShowApproveModal(false);
        setSelectedProject(null);
      }
    } catch (err) { console.error("approve error:", err); }
  };

  // ── Confirm reject ──
  const handleRejectConfirm = async (reason) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`http://localhost:3000/api/projects/${selectedProject.id}/status`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: "REJECTED", reason }),
      });
      if (res.ok) {
        setProjects(prev => prev.map(p =>
          p.id === selectedProject.id ? { ...p, status: "REJECTED" } : p
        ));
        setShowRejectModal(false);
        setSelectedProject(null);
      }
    } catch (err) { console.error("reject error:", err); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  // ── State helpers ──
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

  // ── Stats ──
  const pendingCount  = projects.filter(p => p.status === "PENDING").length;
  const approvedCount = projects.filter(p => p.status === "VALIDATED").length;
  const rejectedCount = projects.filter(p => p.status === "REJECTED").length;

  // ── Filter by activeFilter + search ──
  const filteredProjects = projects
    .filter(p => p.status === activeFilter)
    .filter(p =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.teacher_name || p.external_supervisor_name || "")
        .toLowerCase().includes(searchQuery.toLowerCase())
    );

  const projectsPerPage   = 6;
  const totalPages        = Math.max(1, Math.ceil(filteredProjects.length / projectsPerPage));
  const startIndex        = (currentPage - 1) * projectsPerPage;
  const paginatedProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

  // ── Section title ──
  const sectionTitle = {
    PENDING:   "Proposal Review and Approval",
    VALIDATED: "Approved Projects",
    REJECTED:  "Rejected Projects",
  }[activeFilter];

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col">

        {/* ==================== HEADER ==================== */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Manage and track your projects</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search Project"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-12 pr-4 py-3 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-gray-50"
                />
              </div>
              <div className="ml-auto">
                <ProfileDropdown
                  user={currentUser}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        </header>

        {/* ==================== MAIN ==================== */}
        <main className="flex-1 p-8 overflow-auto">

          {/* Stat Cards */}
          <div className="flex gap-4 mb-8">
            <StatCard
              icon={<Clock size={22} className="text-yellow-500" />}
              label="Pending" count={pendingCount} color="bg-yellow-50"
              onClick={() => handleFilterChange("PENDING")}
              isActive={activeFilter === "PENDING"}
            />
            <StatCard
              icon={<CheckCircle size={22} className="text-green-500" />}
              label="Approved" count={approvedCount} color="bg-green-50"
              onClick={() => handleFilterChange("VALIDATED")}
              isActive={activeFilter === "VALIDATED"}
            />
            <StatCard
              icon={<XCircle size={22} className="text-red-500" />}
              label="Rejected" count={rejectedCount} color="bg-red-50"
              onClick={() => handleFilterChange("REJECTED")}
              isActive={activeFilter === "REJECTED"}
            />
          </div>

          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-4">{sectionTitle}</h2>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">{error}</div>
          )}

          {/* Projects Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {paginatedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onApprove={handleApproveClick}
                    onReject={handleRejectClick}
                    onInfo={handleInfoClick}
                  />
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No {activeFilter.toLowerCase()} projects found
                </div>
              )}

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* ==================== MODALS ==================== */}
      {showApproveModal && (
        <ApproveModal
          project={selectedProject}
          onConfirm={handleApproveConfirm}
          onClose={() => { setShowApproveModal(false); setSelectedProject(null); }}
        />
      )}

      {showRejectModal && (
        <RejectModal
          project={selectedProject}
          onConfirm={handleRejectConfirm}
          onClose={() => { setShowRejectModal(false); setSelectedProject(null); }}
        />
      )}

      {/* Modal project info */}
      <ProjectInfoModal
        isOpen={showInfoModal}
        onClose={() => { setShowInfoModal(false); setSelectedProject(null); }}
        project={selectedProject}
        getStateColor={getStateColor}
        getStateText={getStateText}
      />
    </div>
  );
}

export default ProjectDashboard;