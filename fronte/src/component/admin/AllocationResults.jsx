import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import ReassignModal from "../../layout/ReassignModal.jsx";
import PublishResultsModal from "../../layout/PublishResultsModal.jsx";
import AllocationStatistics from "./AllocationStatistics.jsx";
import {
  Search, Users, Download, Award, Star, Calendar,
  TrendingUp, AlertCircle, CheckCircle, RotateCcw, Loader2,
} from "lucide-react";

const API = "http://localhost:3000/api";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

// ─── API helpers ──────────────────────────────────────────────────────────────
const fetchStatistics = async () => {
  const res = await fetch(`${API}/distribution/statistics`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch statistics");
  return res.json();
};

const fetchResults = async () => {
  const res = await fetch(`${API}/distribution/results`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
};

const fetchUnassigned = async () => {
  const res = await fetch(`${API}/distribution/unassigned`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch unassigned teams");
  return res.json();
};

const fetchProjects = async () => {
  const res = await fetch(`${API}/projects/validated`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  const raw = Array.isArray(data) ? data : data.projects || [];
  return raw.map((p) => ({
    id:           p.id,
    name:         p.title || p.name,
    maxStudents:  p.max_students ?? p.maxStudents,
    status:       p.status,
    speciality_id: p.speciality_id, // ← needed for filtering
  }));
};

const postManualAssign = async (team_id, project_id) => {
  const res = await fetch(`${API}/distribution/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ team_id, project_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Manual assign failed");
  return data;
};

// ─── Normalizers ──────────────────────────────────────────────────────────────
const normalizeAssigned = (row) => ({
  id:                row.team_id,
  dbId:              row.team_id,
  status:            "assigned",
  members:           row.team_size,
  leader:            row.leader_name,
  leaderEmail:       row.leader_email,
  speciality_id:     row.speciality_id, // ← add this
  submittedDate:     row.first_submitted_at
    ? new Date(row.first_submitted_at).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : "—",
  academicAverage:    row.team_average ? parseFloat(row.team_average).toFixed(2) : "—",
  assignedProject:    row.project_title,
  assignedProjectId:  row.project_id,
  assignedPriority:   row.assigned_priority,
  maxStudents:        row.max_students,
  mode:               row.mode,
  preferences:        [],
});

const normalizeUnassigned = (row) => ({
  id:                row.team_id,
  dbId:              row.team_id,
  status:            "unassigned",
  members:           row.team_size,
  leader:            row.leader_name,
  leaderEmail:       row.leader_email,
  speciality_id:     row.speciality_id, // ← add this
  submittedDate:     "—",
  academicAverage:   row.team_average ? parseFloat(row.team_average).toFixed(2) : "—",
  assignedProject:   null,
  assignedProjectId: null,
  preferences:       [],
});

// ─── Component ────────────────────────────────────────────────────────────────
const AllocationResults = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [searchQuery,        setSearchQuery]        = useState("");
  const [activeTab,          setActiveTab]          = useState("teams");
  const [showReassignModal,  setShowReassignModal]  = useState(false);
  const [selectedTeam,       setSelectedTeam]       = useState(null);
  const [showPublishModal,   setShowPublishModal]   = useState(false);
  const [publishing,         setPublishing]         = useState(false);

  // Data state
  const [assignedTeams,   setAssignedTeams]   = useState([]);
  const [unassignedTeams, setUnassignedTeams] = useState([]);
  const [projects,        setProjects]        = useState([]); // all projects
  const [filteredProjects, setFilteredProjects] = useState([]); // filtered for modal
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [reassigning,     setReassigning]     = useState(false);
  const [statistics,      setStatistics]      = useState(null);

  // ── Load all data ────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resultsData, unassignedData, projectsData, statsData] = await Promise.all([
        fetchResults(),
        fetchUnassigned(),
        fetchProjects(),
        fetchStatistics(),
      ]);

      setStatistics(statsData);
      setAssignedTeams((resultsData.results || []).map(normalizeAssigned));
      setUnassignedTeams((unassignedData.teams || []).map(normalizeUnassigned));
      setProjects(projectsData); // store all projects
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const allTeams        = [...assignedTeams, ...unassignedTeams];
  const assignedCount   = assignedTeams.length;
  const unassignedCount = unassignedTeams.length;

  const filteredTeams = allTeams.filter((t) =>
    t.leader?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(t.id).includes(searchQuery) ||
    t.assignedProject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUnassigned = unassignedTeams.filter((t) =>
    t.leader?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(t.id).includes(searchQuery)
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleReassign = (team) => {
    setSelectedTeam(team);

    // ── Same pattern as FirstPage.jsx — filter on the frontend ──────────────
    const filtered = projects.filter(
      (p) => p.speciality_id === team.speciality_id
    );
    setFilteredProjects(filtered);
    // ─────────────────────────────────────────────────────────────────────────

    setShowReassignModal(true);
  };

  const handleAssignProject = async (teamId, project) => {
    setReassigning(true);
    try {
      await postManualAssign(teamId, project.id);
      await loadData();
      setShowReassignModal(false);
      setSelectedTeam(null);
      setFilteredProjects([]);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setReassigning(false);
    }
  };

  const handlePublishResults = () => setShowPublishModal(true);

  const handleConfirmPublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`${API}/distribution/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur");

      alert(
        `✅ Résultats publiés !\n` +
        `📨 ${data.notified_students} étudiant(s) notifié(s)\n` +
        `✔️ ${data.assigned_teams} équipe(s) assignée(s)\n` +
        `⚠️ ${data.unassigned_teams} équipe(s) non assignée(s)`
      );
      setShowPublishModal(false);
    } catch (err) {
      alert(`❌ ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleExportReport = () => {
    alert("Rapport d'allocation exporté avec succès !");
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getPriorityColor = (priority, matched) => {
    if (matched) return "bg-green-100 text-green-700 border-green-300";
    const colors = {
      1: "bg-yellow-100 text-yellow-700 border-yellow-300",
      2: "bg-gray-100 text-gray-700 border-gray-300",
      3: "bg-orange-100 text-orange-700 border-orange-300",
      4: "bg-blue-100 text-blue-700 border-blue-300",
    };
    return colors[priority] || colors[2];
  };

  // ── Team card ─────────────────────────────────────────────────────────────────
  const TeamCard = ({ team, showAssignButton = false }) => (
    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h4 className="text-lg font-semibold text-[#1e3a5f]">
              Team #{team.id}
            </h4>
            {team.status === "assigned" ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                Assigned
              </span>
            ) : (
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                Not Assigned
              </span>
            )}
            {team.mode && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs border border-gray-200 capitalize">
                {team.mode}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{team.members} members</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={16} />
              <span>{team.leader || "—"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Submitted on {team.submittedDate}</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
            <Award size={16} className="text-blue-600" />
            <span className="text-blue-700 font-medium">
              Academic average: {team.academicAverage} / 20
            </span>
          </div>
        </div>

        {/* Action button */}
        {showAssignButton ? (
          <button
            onClick={() => handleReassign(team)}
            className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152a4d] text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Assign Project
          </button>
        ) : (
          <button
            onClick={() => handleReassign(team)}
            className="flex items-center gap-2 text-[#1e3a5f] hover:text-[#152a4d] font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <RotateCcw size={16} />
            Reassign
          </button>
        )}
      </div>

      {/* Assigned project banner */}
      {team.assignedProject && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
            <CheckCircle size={16} />
            Assigned project:
            {team.assignedPriority && (
              <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">
                Priority #{team.assignedPriority}
              </span>
            )}
          </div>
          <p className="text-green-900 font-semibold">{team.assignedProject}</p>
          <p className="text-green-700 text-xs mt-1">
            Capacity: {team.maxStudents} teams max
          </p>
        </div>
      )}

      {/* Preferences */}
      {team.preferences?.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-3">
            Preferences in order of priority:
          </p>
          <div className="space-y-2">
            {team.preferences.map((pref) => (
              <div
                key={pref.priority}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  pref.matched
                    ? "bg-green-50 border-green-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-xs ${getPriorityColor(pref.priority, pref.matched)}`}
                >
                  #{pref.priority}
                </span>
                <span className={`flex-1 text-sm ${pref.matched ? "text-green-900 font-medium" : "text-gray-700"}`}>
                  {pref.projectName}
                </span>
                {pref.matched && <CheckCircle size={16} className="text-green-600" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Manage automatic and manual project allocation to teams
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Project Allocation: Results
              </h1>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search team or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
            </div>
            <div className="ml-4">
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={() => {}}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center h-64 gap-3 text-gray-500">
              <Loader2 size={28} className="animate-spin" />
              <span>Loading allocation results…</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={20} />
              <div>
                <p className="text-red-700 font-medium">Failed to load data</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={loadData}
                className="ml-auto text-sm text-red-600 underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Teams</p>
                    <p className="text-2xl font-bold text-[#1e3a5f]">{allTeams.length}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <CheckCircle size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Assigned</p>
                    <p className="text-2xl font-bold text-green-600">{assignedCount}</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Unassigned</p>
                    <p className="text-2xl font-bold text-red-500">{unassignedCount}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handlePublishResults}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                >
                  <CheckCircle size={18} />
                  Publish results
                </button>
                <button
                  onClick={handleExportReport}
                  className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all"
                >
                  <Download size={18} />
                  Export report
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6 border-b border-gray-200">
                {[
                  { key: "teams",      label: "Teams",                           icon: <Users size={16} /> },
                  { key: "unassigned", label: `Unassigned (${unassignedCount})`, icon: <AlertCircle size={16} /> },
                  { key: "statistics", label: "Statistics",                       icon: <TrendingUp size={16} /> },
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                      activeTab === key
                        ? "border-[#1e3a5f] text-[#1e3a5f]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {icon}{label}
                  </button>
                ))}
              </div>

              {/* Tab: Teams */}
              {activeTab === "teams" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-lg font-semibold text-[#1e3a5f] mb-1">
                    All Teams & Allocation Results
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    {filteredTeams.length} team(s) found
                  </p>
                  <div className="space-y-6">
                    {filteredTeams.length === 0 ? (
                      <p className="text-center text-gray-400 py-12">No teams found.</p>
                    ) : (
                      filteredTeams.map((team) => (
                        <TeamCard key={team.id} team={team} />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab: Unassigned */}
              {activeTab === "unassigned" && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <h3 className="text-lg font-semibold text-[#1e3a5f]">
                      Unassigned Teams ({unassignedCount})
                    </h3>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">
                    These teams could not be automatically assigned. You can manually assign them.
                  </p>

                  {filteredUnassigned.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        All Teams Assigned!
                      </h3>
                      <p className="text-gray-500">
                        All teams have been successfully assigned to projects.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredUnassigned.map((team) => (
                        <TeamCard key={team.id} team={team} showAssignButton />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Statistics */}
              {activeTab === "statistics" && (
                <AllocationStatistics
                  teams={allTeams}
                  projects={projects}
                  statistics={statistics}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ReassignModal
        isOpen={showReassignModal}
        onClose={() => {
          setShowReassignModal(false);
          setSelectedTeam(null);
          setFilteredProjects([]);
        }}
        team={selectedTeam}
        projects={filteredProjects}  /* ← filtered by speciality, not all projects */
        onAssign={handleAssignProject}
        loading={reassigning}
      />

      <PublishResultsModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handleConfirmPublish}
        assignedCount={assignedCount}
        unassignedCount={unassignedCount}
        loading={publishing}
      />
    </div>
  );
};

export default AllocationResults;