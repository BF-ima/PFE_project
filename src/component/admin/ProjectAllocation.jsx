import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import RunAllocationModal from "../../layout/RunAllocationModal.jsx";
import {
  Search, Users, Download, Play, Award,
  Star, Calendar, TrendingUp, AlertCircle,
  Loader2, CheckCircle, XCircle, RefreshCw, UserCheck,
} from "lucide-react";

const BASE = "http://localhost:3000/api";
const authHeader = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const api = {
  fetchWishes: () =>
    fetch(`${BASE}/distribution/teams`, { headers: authHeader() }).then((r) => r.json()),
  fetchProjectsCount: () =>
    fetch(`${BASE}/projects/all`, { headers: authHeader() }).then((r) => r.json()),
  preview: (mode) =>
    fetch(`${BASE}/distribution/preview`, { method: "POST", headers: authHeader(), body: JSON.stringify({ mode }) }).then((r) => r.json()),
  run: (mode) =>
    fetch(`${BASE}/distribution/run`, { method: "POST", headers: authHeader(), body: JSON.stringify({ mode }) }).then((r) => r.json()),
  results: () =>
    fetch(`${BASE}/distribution/results`, { headers: authHeader() }).then((r) => r.json()),
  unassigned: () =>
    fetch(`${BASE}/distribution/unassigned`, { headers: authHeader() }).then((r) => r.json()),
  manualAssign: (team_id, project_id) =>
    fetch(`${BASE}/distribution/manual`, { method: "POST", headers: authHeader(), body: JSON.stringify({ team_id, project_id }) }).then((r) => r.json()),
  validatedProjects: () =>
    fetch(`${BASE}/projects/all`, { headers: authHeader() }).then((r) => r.json()),
};

const fmt = (n) => (n != null ? parseFloat(n).toFixed(2) : "—");

const getPriorityColor = (priority) => {
  const colors = {
    1: "bg-yellow-100 text-yellow-700 border-yellow-300",
    2: "bg-gray-100 text-gray-700 border-gray-300",
    3: "bg-orange-100 text-orange-700 border-orange-300",
    4: "bg-blue-100 text-blue-700 border-blue-300",
  };
  return colors[priority] || colors[2];
};

const PriorityBadge = ({ priority }) => (
  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getPriorityColor(priority)}`}>
    Choix #{priority}
  </span>
);

const ProjectAllocation = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [searchQuery,   setSearchQuery]   = useState("");
  const [activeTab,     setActiveTab]     = useState("teams");
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedMode,  setSelectedMode]  = useState("average");

  const [teams,         setTeams]         = useState([]);
  const [loadingWishes, setLoadingWishes] = useState(true);
  const [projectsCount, setProjectsCount] = useState(0);

  const [results,         setResults]         = useState([]);
  const [loadingResults,  setLoadingResults]  = useState(false);

  const [unassignedTeams,    setUnassignedTeams]    = useState([]);
  const [loadingUnassigned,  setLoadingUnassigned]  = useState(false);
  const [validatedProjects,  setValidatedProjects]  = useState([]);
  const [selectedProject,    setSelectedProject]    = useState({});
  const [manualSaving,       setManualSaving]       = useState({});

  const [previewing,   setPreviewing]  = useState(false);
  const [previewData,  setPreviewData] = useState(null);
  const [running,      setRunning]     = useState(false);

  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  // ── Deadline state ──────────────────────────────────────────────────────
  const [deadline,       setDeadline]       = useState(null);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  // ── Check existing results → redirect ──────────────────────────────────
  useEffect(() => {
  const checkExistingResults = async () => {
    const res  = await fetch(`${BASE}/distribution/results`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();
    // Only redirect if there are non-direct assignments (i.e. algorithm was actually run)
    const algorithmResults = (data.results || []).filter(r => r.mode !== 'direct');
    if (algorithmResults.length > 0) {
      navigate("/allocationresults", { replace: true });
    }
  };
  checkExistingResults();
}, []);


  // ── Fetch deadline ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`${BASE}/deadline`)
      .then(r => r.json())
      .then(data => {
        if (data.deadline) {
          const dl         = data.deadline;
          const dateStr    = dl.deadline_date.slice(0, 10);
          const timeStr    = (dl.deadline_time || "00:00:00").slice(0, 5);
          const deadlineAt = new Date(`${dateStr}T${timeStr}:00`);
          setDeadline(deadlineAt);
          setDeadlinePassed(new Date() >= deadlineAt);
        }
      })
      .catch(console.error);
  }, []);

  // ── Re-check every minute whether deadline has passed ──────────────────
  useEffect(() => {
    if (!deadline) return;
    const interval = setInterval(() => {
      setDeadlinePassed(new Date() >= deadline);
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  // ── Load wishes on mount ───────────────────────────────────────────────
  useEffect(() => {
    setLoadingWishes(true);
    Promise.all([api.fetchWishes(), api.fetchProjectsCount()])
      .then(([wishData, projData]) => {
        const raw = wishData.wishes || [];
        setProjectsCount((projData.projects || []).length);

        const teamMap = {};
        raw.forEach((w) => {
          if (!teamMap[w.team_id]) {
            teamMap[w.team_id] = {
              id:            w.team_id,
              leader:        w.leader_name,
              leaderEmail:   w.leader_email,
              average:       w.team_average,
              submittedDate: w.submitted_at
                ? new Date(w.submitted_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                : "—",
              status:      w.status,
              preferences: [],
            };
          }
          teamMap[w.team_id].preferences.push({
            priority:    w.priority,
            projectName: w.project_title,
            projectId:   w.project_id,
          });
        });

        const grouped = Object.values(teamMap).map((t) => ({
          ...t,
          preferences: t.preferences.sort((a, b) => a.priority - b.priority),
        }));
        setTeams(grouped);
      })
      .catch(() => setError("Impossible de charger les données des équipes."))
      .finally(() => setLoadingWishes(false));
  }, []);

  // ── Load results when tab = statistics ────────────────────────────────
  useEffect(() => {
    if (activeTab !== "statistics") return;
    setLoadingResults(true);
    api.results()
      .then((d) => setResults(d.results || []))
      .catch(() => setError("Impossible de charger les résultats."))
      .finally(() => setLoadingResults(false));
  }, [activeTab]);

  // ── Load unassigned when tab = unassigned ─────────────────────────────
  useEffect(() => {
    if (activeTab !== "unassigned") return;
    setLoadingUnassigned(true);
    Promise.all([api.unassigned(), api.validatedProjects()])
      .then(([u, p]) => {
        setUnassignedTeams(u.teams || []);
        setValidatedProjects(p.projects || []);
      })
      .catch(() => setError("Impossible de charger les équipes non assignées."))
      .finally(() => setLoadingUnassigned(false));
  }, [activeTab]);

  // ── Preview then open modal ────────────────────────────────────────────
  const handleRunAutomaticAllocation = async () => {
    setError(""); setSuccess(""); setPreviewData(null);
    setPreviewing(true);
    try {
      const data = await api.preview(selectedMode);
      if (data.message && !data.assignments) { setError(data.message); return; }
      setPreviewData(data);
      setShowAllocationModal(true);
    } catch {
      setError("Erreur lors de la prévisualisation.");
    } finally {
      setPreviewing(false);
    }
  };

  // ── Confirm: run distribution ──────────────────────────────────────────
  const handleConfirmAllocation = async () => {
    setRunning(true);
    try {
      const data = await api.run(selectedMode);
      if (data.message && !data.assignments) {
        setError(data.message);
        setShowAllocationModal(false);
        return;
      }
      setSuccess(`Distribution effectuée : ${data.total_assigned} équipes assignées, ${data.total_unassigned} non assignées.`);
      setShowAllocationModal(false);
      navigate("/allocationresults");
      setActiveTab("statistics");
    } catch {
      setError("Erreur lors de la distribution.");
      setShowAllocationModal(false);
    } finally {
      setRunning(false);
    }
  };

  // ── Manual assign ──────────────────────────────────────────────────────
  const handleManualAssign = async (teamId) => {
    const projectId = selectedProject[teamId];
    if (!projectId) return;
    setManualSaving((p) => ({ ...p, [teamId]: true }));
    setError(""); setSuccess("");
    try {
      const data = await api.manualAssign(teamId, parseInt(projectId));
      if (data.message?.includes("succès")) {
        setSuccess("Attribution manuelle effectuée avec succès !");
        setUnassignedTeams((prev) => prev.filter((t) => t.team_id !== teamId));
      } else {
        setError(data.message || "Erreur lors de l'attribution.");
      }
    } catch {
      setError("Erreur lors de l'attribution manuelle.");
    } finally {
      setManualSaving((p) => ({ ...p, [teamId]: false }));
    }
  };

  // ── Export CSV ─────────────────────────────────────────────────────────
  const handleExportReport = () => {
    if (results.length === 0) { alert("Lancez d'abord la distribution."); return; }
    const csv = [
      ["Team ID", "Leader", "Email", "Project", "Priority", "Average", "Mode", "Date"],
      ...results.map((r) => [
        r.team_id, r.leader_name, r.leader_email, r.project_title,
        r.assigned_priority, fmt(r.team_average), r.mode,
        new Date(r.assigned_at).toLocaleDateString("fr-FR"),
      ]),
    ].map((row) => row.join(",")).join("\n");
    const a = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: "allocation_report.csv",
    });
    a.click();
  };

  const filteredTeams   = teams.filter(
    (t) => t.leader?.toLowerCase().includes(searchQuery.toLowerCase()) || String(t.id).includes(searchQuery)
  );
  const submittedTeams  = filteredTeams.filter((t) => t.status === "SUBMITTED");

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Manage automatic and manual project allocation to teams</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Project Allocation</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="text" placeholder="Search Team" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
            </div>
            <div className="ml-4">
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">

          {/* Error / Success banners */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} /> {error}
              <button className="ml-auto font-bold" onClick={() => setError("")}>✕</button>
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
              <CheckCircle size={16} /> {success}
              <button className="ml-auto font-bold" onClick={() => setSuccess("")}>✕</button>
            </div>
          )}

          {/* Deadline warning banners */}
          {!deadline && (
            <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              No deadline has been set yet. Please set a deadline before running allocation.
            </div>
          )}
          {deadline && !deadlinePassed && (
            <div className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={16} />
              Automatic allocation is locked until the student submission deadline passes.{" "}
              <span className="font-semibold ml-1">
                Deadline:{" "}
                {deadline.toLocaleString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
          )}
          {deadline && deadlinePassed && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
              <CheckCircle size={16} />
              The submission deadline has passed. You can now run the automatic allocation.
            </div>
          )}

          {/* Mode + action buttons */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1">
              {[
                { value: "average",      label: "Par moyenne" },
                { value: "date",         label: "Par date" },
              ].map((m) => (
                <button key={m.value} onClick={() => setSelectedMode(m.value)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all
                    ${selectedMode === m.value ? "bg-[#1e3a5f] text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRunAutomaticAllocation}
              disabled={previewing || running || !deadlinePassed}
              title={
                !deadline
                  ? "No deadline set"
                  : !deadlinePassed
                  ? `Locked until deadline: ${deadline.toLocaleString("en-GB")}`
                  : ""
              }
              className="flex items-center gap-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] hover:from-[#152a4d] hover:to-[#2575a0] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm">
              {previewing ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
              {previewing ? "Prévisualisation…" : "Run automatic allocation"}
            </button>

            <button onClick={handleExportReport}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all">
              <Download size={18} /> Export report
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            {[
              { key: "teams",      label: "Teams",      icon: Users,       count: submittedTeams.length },
              { key: "unassigned", label: "Unassigned", icon: AlertCircle, count: unassignedTeams.length },
              { key: "statistics", label: "Statistics",  icon: TrendingUp,  count: null },
            ].map(({ key, label, icon: Icon, count }) => (
              <button key={key} onClick={() => { setActiveTab(key); setError(""); setSuccess(""); }}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2
                  ${activeTab === key ? "border-[#1e3a5f] text-[#1e3a5f]" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                <Icon size={16} /> {label}
                {count != null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                    ${activeTab === key ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-500"}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* TEAMS TAB */}
          {activeTab === "teams" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-[#1e3a5f] mb-1">List of Teams and Their Preferences</h3>
              <p className="text-gray-500 text-sm mb-6">View the preferences submitted by teams</p>

              {loadingWishes ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
                </div>
              ) : submittedTeams.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-gray-300">
                  <Users size={48} className="mb-3" />
                  <p className="text-sm text-gray-400">Aucune équipe n'a encore soumis ses préférences.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {submittedTeams.map((team) => (
                    <div key={team.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-6 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2 flex-wrap">
                            <h4 className="text-lg font-semibold text-[#1e3a5f]">Équipe #{team.id}</h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Star size={16} /><span>{team.leader}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar size={16} /><span>Submitted on {team.submittedDate}</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                            <Award size={16} className="text-blue-600" />
                            <span className="text-blue-700 font-medium text-sm">Average: {fmt(team.average)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500 mb-3">Preferences in order of priority:</p>
                        <div className="space-y-2">
                          {team.preferences.map((pref) => (
                            <div key={pref.priority} className="flex items-center gap-3">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-xs ${getPriorityColor(pref.priority)}`}>
                                #{pref.priority}
                              </span>
                              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2">
                                <span className="text-gray-700 text-sm">{pref.projectName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* UNASSIGNED TAB */}
          {activeTab === "unassigned" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-[#1e3a5f]">Attribution manuelle</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Équipes ayant soumis leurs voeux mais non encore assignées</p>
                </div>
                <button
                  onClick={() => {
                    setLoadingUnassigned(true);
                    Promise.all([api.unassigned(), api.validatedProjects()])
                      .then(([u, p]) => { setUnassignedTeams(u.teams || []); setValidatedProjects(p.projects || []); })
                      .finally(() => setLoadingUnassigned(false));
                  }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1e3a5f]">
                  <RefreshCw size={13} /> Actualiser
                </button>
              </div>

              {loadingUnassigned ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#2D8FBF]" />
                </div>
              ) : unassignedTeams.length === 0 ? (
                <div className="flex flex-col items-center py-16">
                  <CheckCircle size={48} className="mb-3 text-green-300" />
                  <p className="text-sm text-gray-400">Toutes les équipes sont assignées !</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {unassignedTeams.map((team) => (
                    <div key={team.team_id} className="px-6 py-4 flex items-center gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800">{team.leader_name}</p>
                        <p className="text-xs text-gray-400">{team.leader_email}</p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users size={11} /> {team.team_size} membre{team.team_size > 1 ? "s" : ""}
                          </span>
                          <span className="text-xs text-gray-500">Moy: {fmt(team.team_average)}</span>
                        </div>
                      </div>
                      <select
                        value={selectedProject[team.team_id] || ""}
                        onChange={(e) => setSelectedProject((p) => ({ ...p, [team.team_id]: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] w-64">
                        <option value="">-- Choisir un projet --</option>
                        {validatedProjects.map((p) => (
                          <option key={p.id} value={p.id}>{p.title} (max {p.max_students})</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleManualAssign(team.team_id)}
                        disabled={!selectedProject[team.team_id] || manualSaving[team.team_id]}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white text-sm font-medium rounded-lg disabled:opacity-40">
                        {manualSaving[team.team_id] ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                        Assigner
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STATISTICS TAB */}
          {activeTab === "statistics" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-[#1e3a5f]">Résultats de la distribution</h3>
                <button
                  onClick={() => {
                    setLoadingResults(true);
                    api.results().then((d) => setResults(d.results || [])).finally(() => setLoadingResults(false));
                  }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-[#1e3a5f]">
                  <RefreshCw size={13} /> Actualiser
                </button>
              </div>

              {loadingResults ? (
                <div className="flex justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-[#2D8FBF]" />
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-gray-300">
                  <TrendingUp size={48} className="mb-3" />
                  <p className="text-sm text-gray-400">Aucun résultat. Lancez la distribution automatique.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <th className="px-6 py-3 text-left">Équipe</th>
                        <th className="px-6 py-3 text-left">Projet attribué</th>
                        <th className="px-6 py-3 text-center">Taille</th>
                        <th className="px-6 py-3 text-center">Moyenne</th>
                        <th className="px-6 py-3 text-center">Choix obtenu</th>
                        <th className="px-6 py-3 text-center">Mode</th>
                        <th className="px-6 py-3 text-center">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {results.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="px-6 py-3">
                            <p className="font-medium text-gray-800">{r.leader_name}</p>
                            <p className="text-xs text-gray-400">{r.leader_email}</p>
                          </td>
                          <td className="px-6 py-3">
                            <p className="font-medium text-gray-800">{r.project_title}</p>
                            <p className="text-xs text-gray-400">Max {r.max_students}</p>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <span className="flex items-center justify-center gap-1 text-gray-600">
                              <Users size={13} />{r.team_size}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-center font-medium text-[#1e3a5f]">{fmt(r.team_average)}</td>
                          <td className="px-6 py-3 text-center"><PriorityBadge priority={r.assigned_priority} /></td>
                          <td className="px-6 py-3 text-center">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{r.mode}</span>
                          </td>
                          <td className="px-6 py-3 text-center text-xs text-gray-400">
                            {new Date(r.assigned_at).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <RunAllocationModal
        isOpen={showAllocationModal}
        onClose={() => { if (!running) setShowAllocationModal(false); }}
        onConfirm={handleConfirmAllocation}
        confirming={running}
        teamsCount={previewData?.total_assigned ?? 0}
        projectsCount={projectsCount}
        unassignedCount={previewData?.total_unassigned ?? 0}
        previewAssignments={previewData?.assignments ?? []}
        mode={selectedMode}
      />
    </div>
  );
};

export default ProjectAllocation;